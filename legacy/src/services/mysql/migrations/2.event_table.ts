import Knex from "knex";

export const up = async (knex: Knex) => {
    await knex.schema.alterTable("mercurios_topics", (table) => {
        table.integer("seq");
    });

    await knex.schema.createTable("mercurios_events", (table) => {
        table.string("topic");
        table.integer("seq");
        table.string("published_at", 30);
        table.string("key");
        table.text("data");

        table.primary(["topic", "seq"]);
    });
};

export const down = async () => {};
