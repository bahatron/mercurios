import $json from "../../services/json";
import streamFactory, { Stream, STREAM_TABLE } from "./stream";
import $error from "../../services/error";
import $mysql from "../../services/mysql";

export const STREAM_DEFINITIONS = "stream_definitions";

class StreamRepository {
    private _streams: Map<string, Stream> = new Map();

    public async create(topic: string, schema?: any): Promise<Stream> {
        await $mysql(STREAM_DEFINITIONS).insert({
            topic,
            schema: $json.stringify(schema),
        });

        let stream = streamFactory({ topic, schema });

        await stream.init();

        this._streams.set(topic, stream);

        return stream;
    }

    public async fetch(topic: string): Promise<Stream> {
        if (this._streams.has(topic)) {
            return this._streams.get(topic) as Stream;
        }

        let result = await $mysql(STREAM_DEFINITIONS)
            .where({ topic })
            .first();

        if (!result) {
            throw $error.NotFound(`${topic} not found`);
        }

        let stream = streamFactory(result);

        this._streams.set(topic, stream);

        return stream;
    }

    public async exists(topic: string): Promise<boolean> {
        let result = await $mysql(STREAM_DEFINITIONS)
            .where({ topic })
            .first();

        return Boolean(result);
    }

    public async delete(topic: string): Promise<void> {
        await $mysql(STREAM_DEFINITIONS)
            .where({ topic })
            .delete();

        await $mysql.schema.dropTableIfExists(STREAM_TABLE(topic));

        this._streams.delete(topic);
    }
}

const REPOSITORY = (async function factory() {
    try {
        if (!(await $mysql.schema.hasTable(STREAM_DEFINITIONS))) {
            await $mysql.schema.createTable(STREAM_DEFINITIONS, table => {
                table.string("topic").unique();
                table.text("schema", "longtext");
            });
        }

        return new StreamRepository();
    } catch (err) {
        /** @todo use proper logger */
        console.log(`!!! Error initiating topic repository\n`, err);
        throw process.exit(-1);
    }
})();

const $streams = new Proxy(
    {},
    {
        get(target, handler) {
            return async function(...args: any[]) {
                let repo: any = await REPOSITORY;

                return repo[handler](...args);
            };
        },
    }
) as StreamRepository;

export default $streams;
