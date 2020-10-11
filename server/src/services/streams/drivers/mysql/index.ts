import knex, { Config } from "knex";
import { resolve } from "path";
import $config from "../../../../utils/config";
import { readFileSync } from "fs";

const config: Config = {
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
    },
    migrations: {
        tableName: "mercurios_migrations",
        directory: resolve(__dirname, "./migrations"),
    },
};

export const $mysql = knex(config);
