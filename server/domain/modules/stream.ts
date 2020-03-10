import $error from "../../services/error";
import $json from "../../services/json";
import $mysql from "../../services/mysql";
import $moment from "moment";
import $event, { MercuriosEvent } from "./event";

// type StreamType = Stream;
// export { StreamType as Stream };
export class Stream {
    constructor(public readonly topic: string, public readonly table: string) {}

    public async append(
        data: any = {},
        expectedSeq?: number
    ): Promise<MercuriosEvent> {
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
                        `error writing to stream - expected seq ${expectedSeq} but got ${result}`
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

export default function streamFactory({
    topic,
    table_name,
}: {
    topic: string;
    table_name: string;
}) {
    return new Stream(topic, table_name);
}
