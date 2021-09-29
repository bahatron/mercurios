import * as Knex from "knex";
import { MercuriosEvent } from "../event/event";
import { $error } from "../utils/error";
import {
    appendProcedure,
    createTopic,
    knexEventFilter,
    PostgresClient,
} from "./helpers";
import { STORE_VALUES } from "./values";
import { StoreDriver, StoreDriverFactory } from "./interfaces";
import { setupStore } from "./setup";

/**
 * @todo: leverage postgres date datatype
 */
export const StoreFactory: StoreDriverFactory = async function ({
    url,
    logger,
}) {
    const $postgres = PostgresClient({ url });
    await setupStore($postgres);

    let store: StoreDriver = {
        async insert(options) {
            try {
                let seq = await appendProcedure($postgres, options);
                return MercuriosEvent({ ...options, seq });
            } catch (err: any) {
                if (err.message.includes("ERR_NO_STREAM")) {
                    await createTopic($postgres, options.topic);

                    return store.insert(options);
                } else if (err.message.includes("ERR_CONFLICT")) {
                    throw $error.ExpectationFailed(
                        "Conflict with expected sequence",
                        {
                            code: "ERR_CONFLICT",
                            expectedSeq: options.expectedSeq,
                        }
                    );
                } else {
                    throw err;
                }
            }
        },

        async read(topic, seq) {
            let event = await $postgres
                .table(STORE_VALUES.EVENT_TABLE)
                .where({ topic, seq })
                .first();

            if (!event) {
                return undefined;
            }

            return MercuriosEvent(event);
        },

        async latest(topic) {
            let query = $postgres.raw(
                `select * from ${STORE_VALUES.EVENT_TABLE} where topic = ? and seq = (select seq from ${STORE_VALUES.TOPIC_TABLE} where topic = ?)`,
                [topic, topic]
            );

            let result = (await query).rows.shift();

            if (!result) {
                return undefined;
            }

            return MercuriosEvent(result);
        },

        async filter(topic, filters) {
            let baseQuery = $postgres
                .table(STORE_VALUES.EVENT_TABLE)
                .where({ topic });

            let query = knexEventFilter(baseQuery, filters);

            logger.debug({ query: query.toString() }, "filter query");

            return (await query).map(MercuriosEvent);
        },

        async topics({ like, withEvents, limit, offset }) {
            let query: Knex.QueryBuilder;
            if (withEvents) {
                query = $postgres
                    .table(STORE_VALUES.EVENT_TABLE)
                    .distinct("topic")
                    .orderBy("topic", "asc");

                knexEventFilter(query, withEvents);
            } else {
                query = $postgres
                    .table(STORE_VALUES.TOPIC_TABLE)
                    .select("topic")
                    .orderBy("topic", "asc");
            }

            if (like) {
                query.where("topic", "like", like);
            }

            if (limit) {
                query.limit(limit);
            }

            if (offset) {
                query.offset(offset);
            }

            logger.debug(
                { query: query.toString() },
                "fetching mercurios topics..."
            );

            return (await query).map((record) => record.topic);
        },

        async topicExists(topic) {
            let result = await $postgres
                .table(STORE_VALUES.TOPIC_TABLE)
                .where({ topic })
                .first();

            return Boolean(result);
        },

        async deleteTopic(topic) {
            await $postgres.transaction(async (trx) => {
                await Promise.all([
                    trx
                        .table(STORE_VALUES.EVENT_TABLE)
                        .where({ topic })
                        .delete(),
                    trx
                        .table(STORE_VALUES.TOPIC_TABLE)
                        .where({ topic })
                        .delete(),
                ]);
            });
        },
    };

    return store;
};
