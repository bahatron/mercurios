import Knex from "knex";

export const up = async function (knex: Knex) {
    /**@todo: get table from constants */
    await knex.schema.createTableIfNotExists("mercurios_topics", (table) => {
        table.string("topic").primary();
        table.integer("seq");
    });

    await knex.schema.createTableIfNotExists("mercurios_events", (table) => {
        table.string("topic");
        table.integer("seq");
        table.string("published_at", 30);
        table.text("data");

        table.primary(["topic", "seq"]);
    });
};

export const down = async function (knex: Knex) {
    //
};
