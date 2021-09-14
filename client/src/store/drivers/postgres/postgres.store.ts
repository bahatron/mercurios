import { Json } from "@bahatron/utils";
import * as Knex from "knex";

import { AppendOptions, StoreDriver } from "../../store.interfaces";
import { STORE_COLLECTION } from "../../store.values";
import { PostgresClient } from "./postgres.client";

const STORED_PROCEDURE = "append_event";

export async function PostgresStore({ url }): Promise<StoreDriver> {
    const $postgres = PostgresClient({ url });
    await setup($postgres);

    return <any>{
        async append({
            topic,
            expectedSeq,
            timestamp,
            key,
            data,
        }: AppendOptions) {
            let result = await $postgres.raw(
                `call ${STORED_PROCEDURE}(?, ?, ?, ?)`,
                [
                    topic,
                    expectedSeq ?? null,
                    timestamp,
                    key ?? null,
                    Json.stringify(data) ?? null,
                ]
            );
        },
    };
}

/**
 * @todo: refactor not to use knex
 */
async function setup($postgres: Knex) {
    await $postgres.schema.createTableIfNotExists(
        STORE_COLLECTION.TOPICS,
        (table) => {
            table.string("topic").primary();
            table.integer("seq");
        }
    );

    await $postgres.schema.createTableIfNotExists(
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

    await $postgres.raw(`
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
}
