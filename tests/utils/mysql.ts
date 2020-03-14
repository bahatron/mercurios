import knex, { Config } from "knex";
import $env from "@bahatron/env";

const config: Config = {
    client: "mysql2",
    connection: {
        host: $env.get("MYSQL_HOST"),
        port: parseInt($env.get("MYSQL_PORT")),
        user: $env.get("MYSQL_USER"),
        password: $env.get("MYSQL_PASSWORD"),
        database: $env.get("MYSQL_DATABASE"),
    },
};

const $mysql = knex(config);

export default $mysql;
