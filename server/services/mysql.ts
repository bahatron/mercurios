import knex, { Config } from "knex";
import $path from "path";
import $config from "../services/config";

/** @todo: Fix migrations directory name */
const config: Config = {
    client: "mysql2",
    connection: $config.MYSQL,
    migrations: {
        tableName: "migrations",
        directory: $path.resolve(`/app/migrations`),
    },
};

const $mysql = knex(config);

export default $mysql;
