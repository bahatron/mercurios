import knex from "knex";
import $env from "@bahatron/env";

const config: knex.Config = {
    client: "mysql2",
    connection: {
        host: $env.get("MYSQL_HOST", "mysql"),
        port: parseInt($env.get("MYSQL_PORT", "3306")),
        user: $env.get("MYSQL_USER", "root"),
        password: $env.get("MYSQL_PASSWORD", "secret"),
        database: $env.get("MYSQL_DATABASE", "mercurios"),
    },
};

const $mysql = knex(config);

export { knex };
export default $mysql;
