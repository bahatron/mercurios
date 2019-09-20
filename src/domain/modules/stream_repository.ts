import $db from "../../services/db";
import $json from "../../services/json";
import $dispatcher from "../../services/dispatcher";
import streamFactory, { Stream } from "./stream_factory";
import $error from "../../services/error";

export const STREAM_DEFINITIONS = "stream_definitions";

export const STREAM_TABLE = (topic: string): string => {
    return `stream:_${topic}`;
};

class StreamRepository {
    private _streams: Map<string, Stream> = new Map();

    public async create(topic: string, schema?: any): Promise<Stream> {
        await $db.createTable(STREAM_TABLE(topic), function(table) {
            table.increments();
            table.string("published_at");
            table.text("data", "longtext");
        });

        await $db.insert(STREAM_DEFINITIONS, {
            topic,
            schema: $json.stringify(schema),
        });

        await $dispatcher.publish(`stream_created`, { topic, schema });

        let stream = streamFactory(topic, schema);

        this._streams.set(topic, stream);

        return stream;
    }

    public async fetch(topic: string): Promise<Stream> {
        if (this._streams.has(topic)) {
            return this._streams.get(topic) as Stream;
        }

        let result = await $db.findOneBy(STREAM_DEFINITIONS, { topic });

        if (!result) {
            throw $error.NotFound(`${topic} not found`);
        }

        let stream = streamFactory(result.topic, result.schema);

        this._streams.set(topic, stream);

        return stream;
    }

    public async exists(topic: string): Promise<boolean> {
        let result = await $db.findOneBy(STREAM_DEFINITIONS, { topic });

        return Boolean(result);
    }
}

const REPOSITORY = (async function factory() {
    try {
        await $db.createTable(STREAM_DEFINITIONS, table => {
            table.string("topic").unique();
            table.text("schema", "longtext");
        });

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
