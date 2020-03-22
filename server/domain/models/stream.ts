import $mysql from "../../services/mysql";
import $logger from "../../services/logger";
import $nats from "../../services/nats";
import $error from "../../services/error";
import $json from "../../services/json";
import $moment from "moment";
import $event, { MercuriosEvent } from "./event";
import $validator from "../../services/validator";

export const STREAM_DEFINITIONS = "mercurios_streams";

export function streamTable(topic: string): string {
    return `stream_${topic}`;
}

export class Stream {
    public readonly topic: string;
    public readonly table: string;

    constructor({ topic, table_name }: { topic: string; table_name: string }) {
        this.topic = $validator.string(topic);
        this.table = $validator.string(table_name);
    }

    private async transaction(
        expectedSeq: number,
        published_at: string,
        data?: any
    ) {
        return await $mysql.transaction(async _trx => {
            let seq = (
                await _trx(this.table).insert({
                    published_at,
                    data: $json.stringify(data),
                })
            ).shift();

            if (!seq) {
                throw $error.InternalError(`unexpected mysql response`);
            }

            if (expectedSeq !== seq) {
                throw $error.ExpectationFailed(
                    `error writing to stream - expected seq ${expectedSeq} but got ${seq}`
                );
            }

            return seq;
        });
    }

    public async append(
        data: any = {},
        expectedSeq?: number
    ): Promise<MercuriosEvent> {
        let published_at = $moment().toISOString();

        try {
            let seq: number = expectedSeq
                ? await this.transaction(expectedSeq, published_at, data)
                : await $mysql(this.table).insert({
                      published_at,
                      data: $json.stringify(data),
                  });

            return $event({ topic: this.topic, seq, published_at, data });
        } catch (err) {
            await $mysql.raw(`ALTER TABLE ${this.table} auto_increment = 1`);

            throw err;
        }
    }

    public async read(id: number): Promise<MercuriosEvent | undefined> {
        let result = await $mysql(this.table)
            .where({ seq: id })
            .first();

        if (!result) {
            return undefined;
        }

        let { seq, published_at, data } = result;

        return $event({ topic: this.topic, seq, published_at, data });
    }
}

const Repository = () => {
    const _streams: Map<string, Stream> = new Map();

    $nats.subscribe("mercurios_stream_deleted", (err, msg) => {
        _streams.delete(msg.data);
    });

    $nats.subscribe("mercurios_stream_created", (err, msg) => {
        let topic = msg.data;
        _streams.set(
            topic,
            new Stream({ topic, table_name: streamTable(topic) })
        );
    });

    return {
        async create(topic: string): Promise<Stream> {
            let table_name = streamTable(topic);
            try {
                await $mysql.transaction(async trx => {
                    if (await trx.schema.hasTable(table_name)) {
                        return;
                    }

                    await trx.schema.createTable(table_name, table => {
                        table.increments("seq").primary();
                        table.string("published_at");
                        table.text("data", "longtext");
                    });

                    await trx
                        .table(STREAM_DEFINITIONS)
                        .insert({ topic, table_name });
                });

                await $nats.publish("mercurios_stream_created", topic);

                return new Stream({ topic, table_name });
            } catch (err) {
                if (err.code === "ER_TABLE_EXISTS_ERROR") {
                    $logger.debug("table already exists", err.message);
                    return new Stream({ topic, table_name });
                }
                $logger.error(err);
                throw err;
            }
        },

        async fetch(topic: string): Promise<Stream | null> {
            if (_streams.has(topic)) {
                return _streams.get(topic) as Stream;
            }

            let result = await $mysql(STREAM_DEFINITIONS)
                .where({ topic })
                .first();

            if (!result) {
                return null;
            }

            let stream = new Stream(result);

            _streams.set(topic, stream);

            return stream;
        },

        async delete(topic: string): Promise<void> {
            await $mysql(STREAM_DEFINITIONS)
                .where({ topic })
                .delete();

            await $mysql.schema.dropTableIfExists(streamTable(topic));

            _streams.delete(topic);

            await $nats.publish("mercurios_stream_deleted", topic);
        },
    };
};

const $streams = Repository();
export default $streams;
