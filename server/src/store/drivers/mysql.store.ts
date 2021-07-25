import { $mysql, MYSQL_CONFIG } from "../../services/mysql/mysql";
import { natsQueryToSql, knexEventFilter } from "../store.helpers";
import $error from "../../utils/error";
import { $json } from "../../utils/json";
import { MercuriosEvent } from "../../models/event";
import Knex from "knex";
import { StoreDriver } from "../store";
import { $logger } from "../../utils/logger";

const EVENT_TABLE = "mercurios_events";
const TOPIC_TABLE = "mercurios_topics";

export function mysqlDriver(): StoreDriver {
    return {
        async isHealthy() {
            try {
                let result = await $mysql
                    .table(MYSQL_CONFIG.migrations?.tableName as string)
                    .first();

                if (!result) {
                    return false;
                }

                return true;
            } catch (err) {
                $logger.error(err, "error checking postgres driver health");
                return false;
            }
        },

        async setup() {
            if (await retrySetup()) {
                return;
            }

            await $mysql.raw(
                `DROP TABLE ${MYSQL_CONFIG.migrations?.tableName}_lock`
            );

            if (await retrySetup()) {
                return;
            }

            throw $error.InternalError("MigrationLocked", { driver: "mysql" });
        },

        async append(event: MercuriosEvent) {
            try {
                let newSeq = await appendTransaction(event);

                return MercuriosEvent({
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

            return MercuriosEvent(result);
        },

        async latest(topic) {
            let result = await $mysql
                .table(TOPIC_TABLE)
                .where({ topic })
                .first();

            if (!result) {
                return undefined;
            }

            return result.seq;
        },

        async filter(topic, filters) {
            let query = $mysql.table(EVENT_TABLE).select("*").where({ topic });

            let result = await knexEventFilter(query, filters);

            return result.map(MercuriosEvent);
        },

        async topics({ like, withEvents }) {
            let query: Knex.QueryBuilder;

            if (withEvents) {
                query = $mysql.table("mercurios_events").distinct("topic");
                knexEventFilter(query, withEvents);
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
            await trx.table(TOPIC_TABLE).insert({ topic, seq: 0 });
            nextSeq = 1;
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

async function retrySetup(): Promise<boolean> {
    let retry = 0;
    while (retry < 3) {
        try {
            await $mysql.migrate.latest();

            return true;
        } catch (err) {
            if (err.name === "MigrationLocked") {
                retry++;

                await new Promise((resolve) =>
                    setTimeout(resolve, Math.random() * 100)
                );
            } else {
                throw err;
            }
        }
    }

    return false;
}
