import { $mysql } from "../../../services/mysql/mysql";
import { natsQueryToSql, sqlEventFilters, EventFilters } from "./helpers";
import $error from "../../../utils/error";
import $json from "../../../utils/json";
import $event, { MercuriosEvent } from "../../event/event";
import Knex from "knex";
import { StoreDriver } from "../store";
import $logger from "../../../utils/logger";

const EVENT_TABLE = "mercurios_events";
const TOPIC_TABLE = "mercurios_topics";

export default function (): StoreDriver {
    return {
        async setup() {
            await $mysql.migrate.latest();
        },

        async createStream(topic) {
            try {
                await $mysql
                    .table("mercurios_topics")
                    .insert({ topic, seq: 0 });
            } catch (err) {
                if (
                    err.message.includes("duplicate key value") ||
                    err.code.includes("ER_DUP_ENTRY")
                ) {
                    return;
                }

                throw err;
            }
        },

        async append(event: MercuriosEvent) {
            try {
                let newSeq = await appendTransaction(event);

                return $event({
                    ...event,
                    seq: newSeq,
                });
            } catch (err) {
                if ((err.message as string).includes("ERR_CONFLICT")) {
                    throw $error.ExpectationFailed(
                        "Conflict with expected sequence",
                        {
                            expectedSeq: event.seq,
                            topic: event.topic,
                        }
                    );
                } else if ((err.message as string).includes("ERR_NO_STREAM")) {
                    throw $error.NotFound(`stream not found`, {
                        topic: event.topic,
                    });
                } else {
                    $logger.error(err);

                    throw $error.InternalError("MySQL error appending event", {
                        err,
                        event,
                    });
                }
            }
        },

        async read(topic: MercuriosEvent["topic"], seq: MercuriosEvent["seq"]) {
            let result = await $mysql
                .table(EVENT_TABLE)
                .where({ topic, seq })
                .first();

            if (!result) {
                return undefined;
            }

            return $event(result);
        },

        async filter(topic, filters) {
            let query = $mysql.table(EVENT_TABLE).select("*").where({ topic });

            let result = await sqlEventFilters(query, filters);

            return result.map($event);
        },

        async topics({ like, withEvents }) {
            let query: Knex.QueryBuilder;

            if (withEvents) {
                query = $mysql.table("mercurios_events").distinct("topic");
                sqlEventFilters(query, withEvents);
            } else {
                query = $mysql.table("mercurios_topics").select("topic");
            }

            if (like) {
                query.where(`topic`, "like", natsQueryToSql(like));
            }

            return (await query).map((record) => record.topic);
        },

        async streamExists(topic: MercuriosEvent["topic"]) {
            let result = await $mysql
                .table(TOPIC_TABLE)
                .where({ topic })
                .first();

            return Boolean(result);
        },

        async deleteStream(topic: string) {
            await Promise.all([
                $mysql.transaction(async (trx) => {
                    await trx.table(EVENT_TABLE).where({ topic }).delete();
                    await trx.table(TOPIC_TABLE).where({ topic }).delete();
                }),
            ]);
        },
    };
}

async function appendTransaction({
    topic,
    published_at,
    data,
    seq: expectedSeq,
    key,
}: MercuriosEvent) {
    return await $mysql.transaction(async (trx) => {
        let nextSeq: number | null =
            (
                await trx(TOPIC_TABLE)
                    .select("seq")
                    .where({ topic })
                    .forUpdate()
            ).shift()?.seq + 1;

        if (nextSeq === null || isNaN(nextSeq)) {
            throw new Error("ERR_NO_STREAM");
        } else if (expectedSeq && expectedSeq !== nextSeq) {
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
    seq: expectedSeq,
    key,
    published_at,
    topic,
}: MercuriosEvent) {
    let parsed: any = data ? $json.stringify(data) : null;

    let result: number | undefined = await $mysql.transaction(async (trx) => {
        await trx.raw(`SET @seq = ${expectedSeq || null};`);

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