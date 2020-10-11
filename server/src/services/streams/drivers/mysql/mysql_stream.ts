import { MercuriosStream } from "../../interfaces";
import $event, { MercuriosEvent } from "../../../../models/event";
import $json from "../../../../utils/json";
import $nats from "../../../nats";
import $error, { ERROR_CODES } from "../../../../utils/error";
import { $mysql } from ".";

const EVENT_TABLE = "mercurios_events";
const TOPIC_TABLE = "mercurios_topics";
const PROCEDURE = "store_event";

async function appendTransaction(params: MercuriosEvent) {
    let { topic, published_at, data, seq: expected_seq, key } = params;

    return await $mysql.transaction(async (trx) => {
        let nextSeq: number | null =
            (
                await trx(TOPIC_TABLE)
                    .select("seq")
                    .where({ topic })
                    .forUpdate()
            ).shift()?.seq + 1;

        if (nextSeq === null) {
            throw new Error("ERR_NO_STREAM");
        } else if (expected_seq && expected_seq !== nextSeq) {
            throw new Error("ERR_CONFLICT");
        }

        await trx.table(EVENT_TABLE).insert({
            topic,
            seq: nextSeq,
            published_at,
            key,
            data: $json.stringify(data),
        });

        await trx.table(TOPIC_TABLE).update({ seq: nextSeq }).where({ topic });

        return nextSeq;
    });
}

async function appendProcedure({
    data,
    seq,
    key,
    published_at,
    topic,
}: MercuriosEvent) {
    let parsed: any = data ? $json.stringify(data) : null;

    let result: number | undefined = await $mysql.transaction(async (trx) => {
        await trx.raw(`SET @seq = ${seq || null};`);

        await trx.raw(`call append_event(?, @seq, ?, ?, ?);`, [
            topic,
            published_at,
            key,
            parsed,
        ]);

        let result = await trx.raw(`SELECT @seq`);

        return result.shift()?.shift()?.["@seq"];
    });

    return result;
}

export function MySQLStream(_topic: string): MercuriosStream {
    return {
        async append({ published_at, data, seq, key }) {
            try {
                let newSeq = await appendTransaction({
                    published_at,
                    key,
                    data,
                    seq,
                    topic: _topic,
                });

                // let newSeq = await appendProcedure({
                //     data,
                //     seq,
                //     published_at,
                //     key,
                //     topic: _topic,
                // });

                return $event({
                    topic: _topic,
                    seq: newSeq,
                    published_at,
                    key,
                    data,
                });
            } catch (err) {
                if ((err.message as string).includes("ERR_CONFLICT")) {
                    throw $error.ExpectationFailed(
                        "Conflict with expected sequence",
                        {
                            code: "ERR_CONFLICT",
                            expectedSeq: seq,
                        }
                    );
                }
                await $nats.publish("mercurios_stream_deleted", _topic);

                if ((err.message as string).includes("ERR_NO_STREAM")) {
                    throw $error.NotFound(`Stream for ${_topic} not found`);
                }

                throw err;
            }
        },

        async read(seq) {
            let result = await $mysql
                .table(EVENT_TABLE)
                .where({ topic: _topic, seq })
                .first();

            if (!result) {
                return null;
            }

            return $event(result);
        },

        async filter({ from = 1, to, key }) {
            let query = $mysql
                .table(EVENT_TABLE)
                .select("*")
                .where({ topic: _topic })
                .where("seq", ">=", from);

            if (to) {
                query.where("seq", "<=", to);
            }

            if (key) {
                query.where({ key });
            }

            let result = await query;

            return result.map($event);
        },
    };
}
