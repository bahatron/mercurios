import knex, { Config } from "knex";
import $env from "@bahatron/env";
import $path from "path";
import $logger from "./logger";

/** @todo: Fix migrations directory name */
const config: Config = {
    client: "mysql2",
    connection: {
        host: $env.get("MYSQL_HOST", "mysql"),
        port: parseInt($env.get("MYSQL_PORT", "3306")),
        user: $env.get("MYSQL_USER", "root"),
        password: $env.get("MYSQL_PASSWORD", "secret"),
        database: $env.get("MYSQL_DATABASE", "mercurios"),
    },
    migrations: {
        tableName: "migrations",
        directory: $path.resolve(`/app/migrations`),
    },
};

const $mysql = knex(config);

export default $mysql;
