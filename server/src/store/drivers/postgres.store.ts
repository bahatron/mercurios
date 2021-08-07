import {
    natsQueryToSql,
    knexEventFilter,
    EventFilters,
} from "../store.helpers";
import $error from "../../utils/error";
import { $json } from "../../utils/json";
import { MercuriosEvent } from "../../models/event";
import Knex from "knex";
import $postgres, { POSTGRES_CONFIG } from "../../services/postgres/postgres";
import { StoreDriver } from "../store";
import { $logger } from "../../utils/logger";

export const EVENT_TABLE = "mercurios_events";
export const TOPIC_TABLE = "mercurios_topics";
export const STORE_PROCEDURE = "append_event";

export function pgDriver(): StoreDriver {
    return {
        async isHealthy() {
            try {
                let result = await $postgres
                    .table(POSTGRES_CONFIG.migrations?.tableName as string)
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
            await $postgres.migrate.latest();
        },

        async append({
            topic,
            published_at,
            data,
            seq: expected_seq,
            key,
        }: MercuriosEvent) {
            try {
                let result = await $postgres.raw(
                    `call ${STORE_PROCEDURE}(?, ?, ?, ?, ?)`,
                    [
                        topic,
                        (expected_seq || null) as any,
                        published_at,
                        key || null,
                        $json.stringify(data) || null,
                    ]
                );

                let procedureResult = result.rows.shift();

                return MercuriosEvent({
                    topic: procedureResult.v_topic,
                    key: procedureResult.v_key,
                    seq: procedureResult.v_seq,
                    published_at: procedureResult.v_published_at,
                    data: procedureResult.v_data,
                });
            } catch (err) {
                if ((err.message as string).includes("ERR_NO_STREAM")) {
                    await createStream(topic);
                    return this.append({
                        topic,
                        published_at,
                        data,
                        seq: expected_seq,
                        key,
                    });
                } else if ((err.message as string).includes("ERR_CONFLICT")) {
                    throw $error.ExpectationFailed(
                        "Conflict with expected sequence",
                        {
                            code: "ERR_CONFLICT",
                            expectedSeq: expected_seq,
                        }
                    );
                } else {
                    throw $error.InternalError(
                        "Postgres error appending event",
                        err
                    );
                }
            }
        },

        async read(topic, seq) {
            let result = await $postgres
                .table(EVENT_TABLE)
                .where({ topic, seq })
                .first();

            if (!result) {
                return undefined;
            }

            return MercuriosEvent(result);
        },

        async latest(topic) {
            let query = await $postgres.raw(
                `select * from ${EVENT_TABLE} where topic = ? and seq = (select seq from ${TOPIC_TABLE} where topic = ?)`,
                [topic, topic]
            );

            let result = query.rows.shift();

            if (!result) {
                return undefined;
            }

            return MercuriosEvent(result);
        },

        async filter(topic: MercuriosEvent["topic"], filters: EventFilters) {
            let query = $postgres
                .table(EVENT_TABLE)
                .select("*")
                .where({ topic });

            let result = await knexEventFilter(query, filters);

            return result.map(MercuriosEvent);
        },

        async topics({ like, withEvents, limit, offset }): Promise<string[]> {
            let query: Knex.QueryBuilder;

            if (withEvents) {
                query = $postgres
                    .table(EVENT_TABLE)
                    .distinct("topic")
                    .orderBy("topic", "asc");

                knexEventFilter(query, withEvents);
            } else {
                query = $postgres
                    .table(TOPIC_TABLE)
                    .select("topic")
                    .orderBy("topic", "asc");
            }

            if (like) {
                query.where(`topic`, "like", natsQueryToSql(like));
            }

            if (limit) {
                query.limit(limit);
            }

            if (offset) {
                query.offset(offset);
            }

            return (await query).map((record) => record.topic);
        },

        async streamExists(topic: MercuriosEvent["topic"]) {
            let result = await $postgres
                .table(TOPIC_TABLE)
                .where({ topic })
                .first();

            return Boolean(result);
        },

        async deleteStream(topic: string) {
            await Promise.all([
                $postgres.transaction(async (trx) => {
                    await trx.table(EVENT_TABLE).where({ topic }).delete();
                    await trx.table(TOPIC_TABLE).where({ topic }).delete();
                }),
            ]);
        },
    };
}

async function createStream(topic: string) {
    try {
        await $postgres.table("mercurios_topics").insert({ topic, seq: 0 });
    } catch (err) {
        if (
            err.message.includes("duplicate key value") ||
            err.code === "23505"
        ) {
            return;
        }

        throw err;
    }
}