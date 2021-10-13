import { Knex, knex } from "knex";
import { EventFactory } from "./event";
import { $error } from "../utils/error";
import { appendProcedure, createTopic, knexEventFilter } from "./helpers";
import { STORE_VALUES } from "./values";
import { StoreDriver, StoreDriverFactory } from "./interfaces";
import { setupStore } from "./setup";
import { Logger } from "@bahatron/utils/lib/logger";
import { $logger } from "../utils/logger";

/**
 * @todo: leverage postgres date datatype
 */
export const StoreFactory: StoreDriverFactory = async function ({
    url,
    logger,
}) {
    const $postgres = PostgresClient({ url, logger });
    await setupStore($postgres);
    // await setupDispatcher($postgres);

    let store: StoreDriver = {
        async insert(options) {
            try {
                let seq = await appendProcedure($postgres, options);

                let event = EventFactory({ ...options, seq });

                logger.debug(event, "mercurios event appended");
                return event;
            } catch (err: any) {
                if (err.message.includes("ERR_NO_STREAM")) {
                    await createTopic($postgres, options.topic);
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
            let event = await $postgres
                .table(STORE_VALUES.EVENT_TABLE)
                .where({ topic, seq })
                .first();

            if (!event) {
                return undefined;
            }

            return EventFactory(event);
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

            return EventFactory(result);
        },

        async filter(topic, filters) {
            let baseQuery = $postgres
                .table(STORE_VALUES.EVENT_TABLE)
                .where({ topic })
                .orderBy("seq", "asc");

            let query = knexEventFilter(baseQuery, filters);

            logger.debug({ query: query.toString() }, "filter query");

            return (await query).map(EventFactory);
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

            return (await query).map((record: any) => record.topic);
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

            logger.debug({ topic }, `topic deleted`);
        },
    };

    return store;
};

function PostgresClient({ url, logger }: { url: string; logger: Logger }) {
    let listening: boolean;

    return knex({
        client: "pg",
        connection: url,
        pool: {
            min: 2,
            max: 20,
            propagateCreateError: false,
            afterCreate: (connection, done) => {
                if (listening) {
                    done(null, connection);
                    return;
                }
                listening = true;
                connection.query(
                    `LISTEN ${STORE_VALUES.NOTIFICATION_CHANNEL}`,
                    function (err) {
                        if (err) {
                            listening = false;
                        } else {
                            connection.on("notification", (msg) => {
                                $logger.debug(msg, "got notification");
                            });
                            connection.on("end", () => {
                                listening = false;
                            });

                            connection.on("error", (err) => {
                                logger.warning(
                                    err,
                                    "error on mercurios notification"
                                );
                            });
                        }
                        done(err, connection);
                    }
                );
            },
        },
    });
}
