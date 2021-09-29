import { Json } from "@bahatron/utils";
import * as Knex from "knex";
import { MercuriosEvent } from "../../event/event";
import { $error } from "../../utils/error";
import { knexEventFilter, natsQueryToSql } from "../store.helpers";
import { STORE_COLLECTION } from "../store.values";
import {
    StoreDriver,
    StoreDriverFactory,
    InsertOptions,
} from "../store.interface";

const STORED_PROCEDURE = "append_event";
const POSTGRES_CONFIG = {
    client: "pg",
    pool: {
        min: 2,
        max: 20,
        propagateCreateError: false,
    },
};

function PostgresClient({ url }) {
    return Knex.default({
        ...POSTGRES_CONFIG,
        connection: url,
    });
}

/**
 * @todo: leverage postgres date datatype
 */
export const PostgresDriver: StoreDriverFactory = async function ({
    url,
    logger,
}) {
    const $postgres = PostgresClient({ url });
    await setup($postgres);

    let store: StoreDriver = {
        async insert(options) {
            try {
                return await appendProcedure($postgres, options);
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
                .table(STORE_COLLECTION.EVENTS)
                .where({ topic, seq })
                .first();

            if (!event) {
                return undefined;
            }

            return MercuriosEvent(event);
        },

        async latest(topic) {
            let query = $postgres.raw(
                `select * from ${STORE_COLLECTION.EVENTS} where topic = ? and seq = (select seq from ${STORE_COLLECTION.TOPICS} where topic = ?)`,
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
                .table(STORE_COLLECTION.EVENTS)
                .where({ topic });

            let query = knexEventFilter(baseQuery, filters);

            logger.debug({ query: query.toString() }, "filter query");

            return (await query).map(MercuriosEvent);
        },

        async topics({ like, withEvents, limit, offset }) {
            let query: Knex.QueryBuilder;
            if (withEvents) {
                query = $postgres
                    .table(STORE_COLLECTION.EVENTS)
                    .distinct("topic")
                    .orderBy("topic", "asc");

                knexEventFilter(query, withEvents);
            } else {
                query = $postgres
                    .table(STORE_COLLECTION.TOPICS)
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

            logger.debug(
                { query: query.toString() },
                "fetching mercurios topics..."
            );

            return (await query).map((record) => record.topic);
        },

        async topicExists(topic) {
            let result = await $postgres
                .table(STORE_COLLECTION.TOPICS)
                .where({ topic })
                .first();

            return Boolean(result);
        },

        async deleteTopic(topic) {
            await $postgres.transaction(async (trx) => {
                await Promise.all([
                    trx
                        .table(STORE_COLLECTION.EVENTS)
                        .where({ topic })
                        .delete(),
                    trx
                        .table(STORE_COLLECTION.TOPICS)
                        .where({ topic })
                        .delete(),
                ]);
            });
        },
    };

    return store;
};

async function appendProcedure(
    $postgres: Knex,
    { topic, expectedSeq, timestamp, key, data }: InsertOptions
) {
    let result = await $postgres.raw(
        `call ${STORED_PROCEDURE}(?, ?, ?, ?, ?)`,
        [
            topic,
            expectedSeq ?? null,
            timestamp,
            key ?? null,
            Json.stringify(data) ?? null,
        ]
    );

    let seq = result.rows.shift().v_seq;

    return MercuriosEvent({ topic, seq, timestamp, key, data });
}

async function createTopic($postgres: Knex, topic: string) {
    try {
        await $postgres.table("mercurios_topics").insert({ topic, seq: 0 });
    } catch (err: any) {
        if (
            err.message.includes("duplicate key value") ||
            err.code === "23505"
        ) {
            return;
        }

        throw err;
    }
}

async function setup(knex: Knex) {
    await knex.transaction(async (trx) => {
        if (!(await trx.schema.hasTable(STORE_COLLECTION.TOPICS))) {
            await trx.schema.createTableIfNotExists(
                STORE_COLLECTION.TOPICS,
                (table) => {
                    table.string("topic").primary();
                    table.integer("seq");
                }
            );
        }

        if (!(await trx.schema.hasTable(STORE_COLLECTION.EVENTS))) {
            await trx.schema.createTableIfNotExists(
                STORE_COLLECTION.EVENTS,
                (table) => {
                    table.string("topic");
                    table.integer("seq");
                    table.string("timestamp");
                    table.string("key");
                    table.text("data");

                    table.primary(["topic", "seq"]);
                    table.index(["key"]);
                    table.index(["timestamp"]);
                }
            );
        }

        await trx.raw(`
            CREATE OR REPLACE PROCEDURE ${STORED_PROCEDURE} (
                inout v_topic varchar(255),
                inout v_seq integer,
                inout v_timestamp varchar(255),
                inout v_key varchar(255),
                inout v_data text
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                next_seq integer;
            BEGIN
                next_seq := (
                        SELECT seq FROM ${STORE_COLLECTION.TOPICS} WHERE topic = v_topic FOR UPDATE
                    ) + 1;
    
                IF (next_seq IS NULL) THEN
                    RAISE 'ERR_NO_STREAM';
                ELSIF v_seq IS NOT NULL AND next_seq != v_seq THEN
                    RAISE 'ERR_CONFLICT';
                END IF;
    
                UPDATE ${STORE_COLLECTION.TOPICS} SET seq = next_seq
                    WHERE topic = v_topic;
    
                INSERT INTO ${STORE_COLLECTION.EVENTS} (topic, seq, timestamp, key, data)
                    VALUES (v_topic, next_seq, v_timestamp, v_key, v_data)
                    returning seq into v_seq;
                COMMIT;
            END;
            $$;
        `);
    });
}
