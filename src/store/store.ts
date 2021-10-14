import { Knex, knex } from "knex";
import { EventFactory } from "./event";
import { $error } from "../utils/error";
import { appendProcedure, createTopic, knexEventFilter } from "./helpers";
import { StoreDriver, StoreDriverFactory, STORE_VALUES } from "./static";
import { setupStore } from "./setup";
import { PostgresClient } from "./driver";

/**
 * @todo: leverage postgres date datatype
 */
export const StoreFactory: StoreDriverFactory = async function ({
    url,
    logger,
}) {
    const _pg = PostgresClient({ url, logger });
    await setupStore(_pg);
    // await setupDispatcher(_pg);

    let store: StoreDriver = {
        async insert(options) {
            try {
                let seq = await appendProcedure(_pg, options);

                let event = EventFactory({ ...options, seq });

                logger.debug(event, "mercurios event appended");
                return event;
            } catch (err: any) {
                if (err.message.includes("ERR_NO_STREAM")) {
                    await createTopic(_pg, options.topic);
                    logger.debug({ topic: options.topic }, "topic created");

                    return store.insert(options);
                } else if (err.message.includes("ERR_CONFLICT")) {
                    throw $error.ExpectationFailed(
                        "Conflict with expected sequence",
                        {
                            reason: "ERR_CONFLICT",
                            expectedSeq: options.expectedSeq,
                        }
                    );
                } else {
                    throw err;
                }
            }
        },

        async fetch(topic, seq) {
            let event = await _pg
                .table(STORE_VALUES.EVENT_TABLE)
                .where({ topic, seq })
                .first();

            if (!event) {
                return undefined;
            }

            return EventFactory(event);
        },

        async latest(topic) {
            let query = _pg.raw(
                `select * from ${STORE_VALUES.EVENT_TABLE} where topic = ? and seq = (select seq from ${STORE_VALUES.TOPIC_TABLE} where topic = ?)`,
                [topic, topic]
            );

            let result = (await query).rows.shift();

            if (!result) {
                return undefined;
            }

            return EventFactory(result);
        },

        async filter(topic, filters) {
            let baseQuery = _pg
                .table(STORE_VALUES.EVENT_TABLE)
                .where({ topic })
                .orderBy("seq", "asc");

            let query = knexEventFilter(baseQuery, filters);

            logger.debug(
                { query: query.toString() },
                "filtering mercurios topic..."
            );

            return (await query).map(EventFactory);
        },

        async topics({ like, withEvents, limit, offset }) {
            let query: Knex.QueryBuilder;
            if (withEvents) {
                query = _pg
                    .table(STORE_VALUES.EVENT_TABLE)
                    .distinct("topic")
                    .orderBy("topic", "asc");

                knexEventFilter(query, withEvents);
            } else {
                query = _pg
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

            return (await query).map((record: any) => record.topic);
        },

        async topicExists(topic) {
            let result = await _pg
                .table(STORE_VALUES.TOPIC_TABLE)
                .where({ topic })
                .first();

            return Boolean(result);
        },

        async deleteTopic(topic) {
            await _pg.transaction(async (trx) => {
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

            logger.debug({ topic }, `topic deleted`);
        },
    };

    return store;
};
