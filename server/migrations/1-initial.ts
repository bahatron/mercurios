import Knex from "knex";

export const up = async function (knex: Knex) {
    return knex.schema.createTable("mercurios_topics", (table) => {
        table.string("topic").unique();
    });
};

export const down = async function (knex: Knex) {
    return knex.schema.dropTableIfExists("mercurios_topics");
};
