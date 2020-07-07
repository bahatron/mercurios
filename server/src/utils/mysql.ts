import knex, { Config } from "knex";
import $config from "./config";

const config: Config = {
    client: "mysql2",
    connection: {
        host: $config.mysql_host,
        port: $config.mysql_port,
        user: $config.mysql_user,
        password: $config.mysql_password,
        database: $config.mysql_database,
    },
};

const $mysql = knex(config);
export default $mysql;
