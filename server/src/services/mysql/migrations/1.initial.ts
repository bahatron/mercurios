import Knex from "knex";

export const up = async (knex: Knex) => {
    await knex.schema.createTable("mercurios_topics", (table) => {
        table.string("topic").primary();
    });
};

export const down = async () => {};
