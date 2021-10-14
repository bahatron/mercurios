import { STORE_VALUES } from "./static";
import { Knex } from "knex";
import { $logger } from "../utils/logger";

export async function setupStore(knex: Knex) {
    await knex.transaction(async (trx) => {
        if (!(await trx.schema.hasTable(STORE_VALUES.TOPIC_TABLE))) {
            await trx.schema.createTableIfNotExists(
                STORE_VALUES.TOPIC_TABLE,
                (table) => {
                    table.string("topic").primary();
                    table.integer("seq");
                }
            );
        }

        if (!(await trx.schema.hasTable(STORE_VALUES.EVENT_TABLE))) {
            await trx.schema.createTableIfNotExists(
                STORE_VALUES.EVENT_TABLE,
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

            await trx
                .raw(
                    `
                        CREATE TRIGGER notify_${STORE_VALUES.NOTIFICATION_CHANNEL}
                        AFTER INSERT
                        ON "${STORE_VALUES.EVENT_TABLE}"
                        FOR EACH ROW
                        EXECUTE PROCEDURE notify_${STORE_VALUES.NOTIFICATION_CHANNEL}();
                    `
                )
                .catch((err) => {
                    if (err.code === "42710") {
                        return;
                    }

                    throw err;
                });
        }

        await trx
            .raw(
                `
                    CREATE OR REPLACE PROCEDURE ${STORE_VALUES.APPEND_PROCEDURE} (
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
                                SELECT seq FROM ${STORE_VALUES.TOPIC_TABLE} WHERE topic = v_topic FOR UPDATE
                            ) + 1;
            
                        IF (next_seq IS NULL) THEN
                            RAISE 'ERR_NO_STREAM';
                        ELSIF v_seq IS NOT NULL AND next_seq != v_seq THEN
                            RAISE 'ERR_CONFLICT';
                        END IF;
            
                        UPDATE ${STORE_VALUES.TOPIC_TABLE} SET seq = next_seq
                            WHERE topic = v_topic;
            
                        INSERT INTO ${STORE_VALUES.EVENT_TABLE} (topic, seq, timestamp, key, data)
                            VALUES (v_topic, next_seq, v_timestamp, v_key, v_data)
                            returning seq into v_seq;
                        COMMIT;
                    END;
                    $$;
                `
            )
            .catch((err) => {
                if (err.message.includes("tuple concurrently updated")) {
                    $logger.warning(err);
                    return;
                }

                throw err;
            });

        await trx.raw(
            `
                CREATE OR REPLACE FUNCTION notify_${STORE_VALUES.NOTIFICATION_CHANNEL}()
                RETURNS trigger AS
                $BODY$
                    BEGIN
                        PERFORM pg_notify('${STORE_VALUES.NOTIFICATION_CHANNEL}', row_to_json(NEW)::text);
                        RETURN NULL;
                    END; 
                $BODY$
                LANGUAGE plpgsql VOLATILE
                COST 100
            `
        );
    });
}
