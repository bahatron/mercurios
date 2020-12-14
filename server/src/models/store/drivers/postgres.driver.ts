import { natsQueryToSql, sqlEventFilters, EventFilters } from "./helpers";
import $error from "../../../utils/error";
import $json from "../../../utils/json";
import $event, { MercuriosEvent } from "../../event/event";
import Knex from "knex";
import $postgres from "../../../services/postgres/postgres";
import { StoreDriver } from "../store";

const EVENT_TABLE = "mercurios_events";
const TOPIC_TABLE = "mercurios_topics";
const STORE_PROCEDURE = "store_event";

export default function (): StoreDriver {
    return {
        async setup() {
            await $postgres.migrate.latest();
        },

        async createStream(topic) {
            try {
                await $postgres
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

                return $event({
                    topic: procedureResult.v_topic,
                    key: procedureResult.v_key,
                    seq: procedureResult.v_seq,
                    published_at: procedureResult.v_published_at,
                    data: procedureResult.v_data,
                });
            } catch (err) {
                if ((err.message as string).includes("ERR_CONFLICT")) {
                    throw $error.ExpectationFailed(
                        "Conflict with expected sequence",
                        {
                            code: "ERR_CONFLICT",
                            expected_seq,
                        }
                    );
                } else if ((err.message as string).includes("ERR_NO_STREAM")) {
                    throw $error.NotFound(`Stream for topic not found`, {
                        topic,
                    });
                } else {
                    throw $error.InternalError(
                        "Postgres error appending event",
                        err
                    );
                }
            }
        },

        async read(topic: MercuriosEvent["topic"], seq: MercuriosEvent["seq"]) {
            let result = await $postgres
                .table(EVENT_TABLE)
                .where({ topic, seq })
                .first();

            if (!result) {
                return undefined;
            }

            return $event(result);
        },

        async filter(topic: MercuriosEvent["topic"], filters: EventFilters) {
            let query = $postgres
                .table(EVENT_TABLE)
                .select("*")
                .where({ topic });

            let result = await sqlEventFilters(query, filters);

            return result.map($event);
        },

        async topics({
            like,
            withEvents,
        }: {
            like?: string;
            withEvents: EventFilters;
        }): Promise<string[]> {
            let query: Knex.QueryBuilder;

            if (withEvents) {
                query = $postgres.table("mercurios_events").distinct("topic");
                sqlEventFilters(query, withEvents);
            } else {
                query = $postgres.table("mercurios_topics").select("topic");
            }

            if (like) {
                query.where(`topic`, "like", natsQueryToSql(like));
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