import knex, { Config } from "knex";
import { resolve } from "path";
import { readFileSync } from "fs";
import { $config } from "../../utils/config";

export const MYSQL_CONFIG: Config = {
    client: "mysql2",
    connection: {
        host: $config.mysql_host,
        port: $config.mysql_port,
        user: $config.mysql_user,
        password: $config.mysql_password,
        database: $config.mysql_database,
        ssl:
            $config.mysql_rds_ssl === "1"
                ? {
                      ca: readFileSync(
                          "/etc/ssl/rds-combined-ca-bundle.pem"
                      ).toString(),
                  }
                : undefined,
        pool: <any>{
            min: 2,
            max: 20,
            propagateCreateError: false,
        },
    },
    migrations: {
        tableName: "mercurios_migrations",
        directory: resolve(__dirname, "./migrations"),
        extension: "js",
    },
};

export const $mysql = knex(MYSQL_CONFIG);
