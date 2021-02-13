import Knex, { Config } from "knex";
import { $config } from "../../utils/config";
import { resolve } from "path";

export const POSTGRES_CONFIG: Config = {
    client: "pg",
    connection: {
        host: $config.postgre_host,
        port: parseInt($config.postgre_port),
        user: $config.postgre_user,
        password: $config.postgre_password,
        database: $config.postgre_database,
    },
    migrations: {
        tableName: "mercurios_migrations",
        directory: resolve(__dirname, "./migrations"),
    },
};

const $postgres = Knex(POSTGRES_CONFIG);

export default $postgres;
