import { Logger, Observable } from "@bahatron/utils";
import { parse } from "@bahatron/utils/lib/json";
import knex, { Knex } from "knex";
import { EventFactory } from "./event";

export const EVENT_TABLE = (prefix) => `${prefix}_events`;
export const TOPIC_TABLE = (prefix) => `${prefix}_topics`;
export const APPEND_PROCEDURE = (prefix) => `${prefix}_append_event`;
export const NOTIFICATION_CHANNEL = (prefix) => `${prefix}_event_created`;

/**
 * @todo: leverage postgres date datatype?
 */
export async function postgresDriver({
    url,
    observer,
    logger,
    tablePrefix,
}: {
    url: string;
    logger: Logger.Logger;
    observer: Observable.Observable;
    tablePrefix: string;
}) {
    try {
        let _listening: boolean = false;

        let client = knex({
            client: "pg",
            connection: url,
            pool: {
                min: 2,
                max: 20,
                propagateCreateError: false,
                afterCreate: (connection, done) => {
                    if (_listening) {
                        done(null, connection);
                        return;
                    }

                    _listening = true;

                    connection.query(
                        `LISTEN ${NOTIFICATION_CHANNEL(tablePrefix)}`,
                        (err) => {
                            if (err) {
                                _listening = false;
                            } else {
                                connection.on("notification", (msg) => {
                                    let payload = parse(msg.payload);
                                    observer.emit(
                                        "event",
                                        EventFactory(payload)
                                    );
                                });

                                connection.on("end", () => {
                                    _listening = false;
                                });

                                connection.on("error", logger.warning);
                            }
                            done(err, connection);
                        }
                    );
                },
            },
        });

        await setupStore(client, tablePrefix);

        return client;
    } catch (err: any) {
        logger.error(err);
        throw err;
    }
}

async function setupStore(client: Knex, tablePrefix: string) {
    try {
        await client.transaction(async (trx) => {
            if (!(await trx.schema.hasTable(TOPIC_TABLE(tablePrefix)))) {
                await trx.schema.createTable(
                    TOPIC_TABLE(tablePrefix),
                    (table) => {
                        table.string("topic").primary();
                        table.integer("seq");
                    }
                );
            }

            await trx.raw(
                `
                    CREATE OR REPLACE FUNCTION notify_${NOTIFICATION_CHANNEL(
                        tablePrefix
                    )}()
                    RETURNS trigger AS
                    $BODY$
                        BEGIN
                            PERFORM pg_notify('${NOTIFICATION_CHANNEL(
                                tablePrefix
                            )}', row_to_json(NEW)::text);
                            RETURN NULL;
                        END; 
                    $BODY$
                    LANGUAGE plpgsql VOLATILE
                    COST 100
                `
            );

            if (!(await trx.schema.hasTable(EVENT_TABLE(tablePrefix)))) {
                await trx.schema.createTable(
                    EVENT_TABLE(tablePrefix),
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

            await trx.raw(
                `
                    CREATE TRIGGER notify_${NOTIFICATION_CHANNEL(tablePrefix)}
                    AFTER INSERT
                    ON "${EVENT_TABLE(tablePrefix)}"
                    FOR EACH ROW
                    EXECUTE PROCEDURE notify_${NOTIFICATION_CHANNEL(
                        tablePrefix
                    )}();
                `
            );

            await trx.raw(
                `
                    CREATE OR REPLACE PROCEDURE ${APPEND_PROCEDURE(
                        tablePrefix
                    )} (
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
                                SELECT seq FROM ${TOPIC_TABLE(
                                    tablePrefix
                                )} WHERE topic = v_topic FOR UPDATE
                            ) + 1;
            
                        IF (next_seq IS NULL) THEN
                            RAISE 'ERR_NO_STREAM';
                        ELSIF v_seq IS NOT NULL AND next_seq != v_seq THEN
                            RAISE 'ERR_CONFLICT';
                        END IF;
            
                        UPDATE ${TOPIC_TABLE(tablePrefix)} SET seq = next_seq
                            WHERE topic = v_topic;
            
                        INSERT INTO ${EVENT_TABLE(
                            tablePrefix
                        )} (topic, seq, timestamp, key, data)
                            VALUES (v_topic, next_seq, v_timestamp, v_key, v_data)
                            returning seq into v_seq;
                        COMMIT;
                    END;
                    $$;
                `
            );
        });
    } catch (err: any) {
        if (
            ["42P16", "23505", "25P02", "XX000", "42710", "42P07"].includes(
                err.code
            )
        ) {
            return;
        }
        throw err;
    }
}
