import streamFactory, { Stream } from "./stream";
import $mysql from "../../services/mysql";
import $logger from "../../services/logger";
import $nats from "../../services/nats";

export const STREAM_DEFINITIONS = "mercurios_streams";

export function streamTable(topic: string): string {
    return `stream_${topic}`;
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
            streamFactory({ topic, table_name: streamTable(topic) })
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

                return streamFactory({ topic, table_name });
            } catch (err) {
                if (err.code === "ER_TABLE_EXISTS_ERROR") {
                    $logger.debug("table already exists", err.message);
                    return streamFactory({ topic, table_name });
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

            let stream = streamFactory(result);

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
