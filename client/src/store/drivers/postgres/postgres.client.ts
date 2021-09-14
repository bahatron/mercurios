import * as Knex from "knex";

const POSTGRES_CONFIG = {
    client: "pg",
    pool: {
        min: 2,
        max: 20,
        propagateCreateError: false,
    },
};

export function PostgresClient({ url }) {
    return Knex.default({
        ...POSTGRES_CONFIG,
        connection: url,
    });
}
