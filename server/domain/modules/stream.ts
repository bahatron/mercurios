import { Schema } from "jsonschema";
import $error from "../../services/error";
import $json from "../../services/json";
import $validator from "../../services/validator";
import $mysql from "../../services/mysql";
import $moment from "moment";
import $event, { MercuriosEvent } from "./event";

export class Stream {
    public readonly schema: Schema;

    constructor(
        public readonly topic: string,
        public readonly table: string,
        schema?: Schema
    ) {
        this.schema = schema ? $json.parse(schema) : {};
    }

    public async init(): Promise<ThisType<Stream>> {
        if (!(await $mysql.schema.hasTable(this.table))) {
            await $mysql.schema.createTable(this.table, function(table) {
                table.increments("seq").primary();
                table.string("published_at");
                table.text("data", "longtext");
            });
        }

        return this;
    }

    public async append(
        data: any = {},
        expectedSeq?: number
    ): Promise<MercuriosEvent> {
        if (!$validator.validate($json.parse(data), this.schema)) {
            throw $error.ValidationFailed("validation failed for event data");
        }

        let published_at = $moment().toISOString();

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

            return $event(this.topic, seq, published_at, data);
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

        return $event(this.topic, seq, published_at, data);
    }
}

interface StreamFactory {
    topic: string;
    table_name: string;
    schema?: Schema;
}
/** @todo: validate schema is valid jsonschema.Schema. Is that even possible? */
export default function streamFactory({
    topic,
    table_name,
    schema,
}: StreamFactory) {
    return new Stream(topic, table_name, schema);
}
