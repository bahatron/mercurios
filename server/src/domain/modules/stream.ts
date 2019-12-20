import { Schema } from "jsonschema";
import $error from "../../services/error";
import $date from "../../services/date";
import $json from "../../services/json";
import $validator from "../../services/validator";
import eventFactory, { Event } from "./event";
import $mysql from "../../services/mysql";

export const STREAM_TABLE = (topic: string): string => {
    return `stream_${topic}`;
};

export class Stream {
    public readonly schema: Schema;
    private readonly table: string;

    constructor(public readonly topic: string, schema?: Schema) {
        this.table = STREAM_TABLE(topic);
        this.schema = schema ? $json.parse(schema) : {};
    }

    public async init(): Promise<void> {
        if (await $mysql.schema.hasTable(this.table)) {
            return;
        }

        await $mysql.schema.createTable(this.table, function(table) {
            table.increments("seq").primary();
            table.string("published_at");
            table.text("data", "longtext");
        });
    }

    public async append(data: any = {}, expectedSeq?: number): Promise<Event> {
        if (!$validator.validate(data, this.schema)) {
            throw $error.ValidationFailed("validation failed for event data");
        }

        let published_at = $date.dateString();

        try {
            let seq = await $mysql.transaction(async _trx => {
                let result = (
                    await _trx(this.table).insert({
                        published_at,
                        data: $json.stringify(data),
                    })
                ).shift();

                if (!result) {
                    throw $error.InternalError(`unexpected mysql response`);
                }

                if (expectedSeq && expectedSeq !== result) {
                    throw $error.ExpectationFailed(
                        `expected seq ${expectedSeq} but got ${result}`
                    );
                }

                return result;
            });

            return eventFactory(this.topic, seq, published_at, data);
        } catch (err) {
            await $mysql.raw(`ALTER TABLE ${this.table} auto_increment = 1`);

            throw err;
        }
    }

    public async read(id: number): Promise<Event | undefined> {
        let result = await $mysql(this.table)
            .where({ seq: id })
            .first();

        if (!result) {
            return undefined;
        }

        let { seq, published_at, data } = result;

        return eventFactory(this.topic, seq, published_at, data);
    }
}

interface StreamFactory {
    topic: string;
    schema?: Schema;
}
/** @todo: validate schema is valid jsonschema.Schema. Is that even possible? */
export default function streamFactory({ topic, schema }: StreamFactory) {
    return new Stream(topic, schema);
}
