import Knex, { Config } from "knex";
import $config from "./config";
import { resolve } from "path";

const config: Config = {
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
        directory: resolve(__dirname, "../models/store/drivers/pg/migrations"),
    },
};

const $pg = Knex(config);

export default $pg;
