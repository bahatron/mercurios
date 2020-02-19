import $json from "../../services/json";
import streamFactory, { Stream } from "./stream";
import $error from "../../services/error";
import $mysql from "../../services/mysql";

export const STREAM_DEFINITIONS = "mercurios_streams";

export function streamTable(topic: string): string {
    return `stream_${topic}`;
}

const Repository = () => {
    const _streams: Map<string, Stream> = new Map();

    return {
        async create(topic: string, schema?: any): Promise<Stream> {
            let table_name: string = streamTable(topic);

            await $mysql(STREAM_DEFINITIONS).insert({
                topic,
                schema: $json.stringify(schema),
                table_name,
            });

            let stream = streamFactory({
                topic,
                table_name,
                schema,
            });

            await stream.init();

            _streams.set(topic, stream);

            return stream;
        },

        async fetch(topic: string): Promise<Stream> {
            if (_streams.has(topic)) {
                return _streams.get(topic) as Stream;
            }

            let result = await $mysql(STREAM_DEFINITIONS)
                .where({ topic })
                .first();

            if (!result) {
                throw $error.NotFound(`${topic} not found`);
            }

            let stream = streamFactory(result);

            _streams.set(topic, stream);

            return stream;
        },

        async exists(topic: string): Promise<boolean> {
            let result = await $mysql(STREAM_DEFINITIONS)
                .where({ topic })
                .first();

            return Boolean(result);
        },

        async delete(topic: string): Promise<void> {
            await $mysql(STREAM_DEFINITIONS)
                .where({ topic })
                .delete();

            await $mysql.schema.dropTableIfExists(streamTable(topic));

            _streams.delete(topic);
        },
    };
};

const $streams = Repository();
export default $streams;
