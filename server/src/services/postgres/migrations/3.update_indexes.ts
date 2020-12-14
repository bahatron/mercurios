import Knex from "knex";

export const up = async (knex: Knex) => {
    await knex.schema.alterTable("mercurios_events", (table) => {
        table.dropIndex(["key", "seq", "published_at"]);
        table.index(["key"]);
        table.index(["published_at"]);
    });
};

export const down = async () => {};
