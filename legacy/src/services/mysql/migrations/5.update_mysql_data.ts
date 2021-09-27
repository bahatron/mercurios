import Knex from "knex";

export const up = async (knex: Knex) => {
    await knex.schema.alterTable("mercurios_events", (table) => {
        table.text("data", "mediumtext").alter();
    });
};

export const down = async () => {};
