import Knex from "knex";

export const up = async (knex: Knex) => {
    await knex.schema.alterTable("mercurios_events", (table) => {
        table.index(["key"]);
        table.index(["published_at"]);
    });
};

export const down = async () => {};
