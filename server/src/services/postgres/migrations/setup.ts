import Knex from "knex";

export const up = async function (knex: Knex) {
    if (!(await knex.schema.hasTable("mercurios_topics"))) {
        await knex.schema.createTable("mercurios_topics", (table) => {
            table.string("topic").primary();
            table.integer("seq");
        });
    }

    if (!(await knex.schema.hasTable("mercurios_events"))) {
        await knex.schema.createTable("mercurios_events", (table) => {
            table.string("topic");
            table.integer("seq");
            table.string("published_at");
            table.string("key");
            table.text("data");

            table.index(["key"]);
            table.index(["published_at"]);

            table.primary(["topic", "seq"]);
        });
    }

    await knex.raw(`
        CREATE OR REPLACE PROCEDURE append_event (
            inout v_topic varchar(255),
            inout v_seq integer,
            inout v_published_at varchar(255),
            inout v_key varchar(255),
            inout v_data text
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            next_seq integer;
        BEGIN
            next_seq := (
                    SELECT seq FROM mercurios_topics WHERE topic = v_topic FOR UPDATE
                ) + 1;

            IF (next_seq IS NULL) THEN
                // RAISE 'ERR_NO_STREAM';
                INSERT INTO mercurios_topics (topic, seq) VALUES (v_topic, 1);
                next_seq = 1;

            ELSIF v_seq IS NOT NULL AND next_seq != v_seq THEN
                RAISE 'ERR_CONFLICT';
            END IF;

            UPDATE mercurios_topics SET seq = next_seq
                WHERE topic = v_topic;

            INSERT INTO mercurios_events (topic, seq, published_at, key, data)
                VALUES (v_topic, next_seq, v_published_at, v_key, v_data)
                returning seq into v_seq;
            COMMIT;
        END;
        $$;
    `);
};

export const down = async () => {};
