import $knex from "../../services/knex";
import $logger from "../../services/logger";
import $nats from "../../services/nats";
import $error from "../../services/error";
import $json from "../../services/json";
import $moment from "moment";
import $event, { MercuriosEvent } from "./event";
import $validator from "../../services/validator";

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
        try {
            return await $knex.transaction(async (_trx) => {
                let seq = (
                    await _trx(this.table).insert({
                        published_at,
                        data: $json.stringify(data),
                    })
                ).shift();

                if (!seq) {
                    throw $error.InternalError(
                        `unexpected response from store`
                    );
                }

                if (expectedSeq !== seq) {
                    throw $error.ExpectationFailed(
                        `error writing to stream - expected seq ${expectedSeq} but got ${seq}`
                    );
                }

                return seq;
            });
        } catch (err) {
            if (err.name === "ExpectationFailed") {
                await $knex.raw(`ALTER TABLE ${this.table} auto_increment = 1`);
            }
            throw err;
        }
    }

    public async append(
        data: any = {},
        expectedSeq?: number
    ): Promise<MercuriosEvent> {
        let published_at = $moment().toISOString();

        let seq: number = expectedSeq
            ? await this.transaction(expectedSeq, published_at, data)
            : await $knex(this.table).insert({
                  published_at,
                  data: $json.stringify(data),
              });

        return $event({ topic: this.topic, seq, published_at, data });
    }

    public async read(id: number): Promise<MercuriosEvent | null> {
        let result = await $knex(this.table).where({ seq: id }).first();

        if (!result) {
            return null;
        }

        let { seq, published_at, data } = result;

        return $event({ topic: this.topic, seq, published_at, data });
    }
}

const Repository = () => {
    return {
        async create(topic: string): Promise<Stream> {
            let table_name = streamTable(topic);
            try {
                await $knex.transaction(async (trx) => {
                    if (await trx.schema.hasTable(table_name)) {
                        return;
                    }

                    await trx.schema.createTable(table_name, (table) => {
                        table.increments("seq").primary();
                        table.string("published_at");
                        table.text("data", "longtext");
                    });
                });

                await $nats.publish("mercurios_stream_created", topic);

                return new Stream({ topic, table_name });
            } catch (err) {
                if (err.code === "ER_TABLE_EXISTS_ERROR") {
                    return new Stream({ topic, table_name });
                }
                $logger.error(err);
                throw err;
            }
        },

        async fetch(topic: string): Promise<Stream | null> {
            let table_name = streamTable(topic);
            if (await $knex.schema.hasTable(table_name)) {
                let stream = new Stream({ topic, table_name });

                return stream;
            }

            return null;
        },

        async delete(topic: string): Promise<void> {
            await $knex.schema.dropTableIfExists(streamTable(topic));

            await $nats.publish("mercurios_stream_deleted", topic);
        },
    };
};

const $streams = Repository();
export default $streams;
