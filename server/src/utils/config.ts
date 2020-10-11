import $env from "@bahatron/env";
import $lodash from "lodash";

const $config = new Proxy(
    {
        server_port: $env.get("MERCURIOS_PORT", "4254"),
        test_url: $env.get("MERCURIOS_TEST_URL", ""),
        dev_mode: Boolean($env.get("MERCURIOS_ENV", "") !== "production"),
        debug: Boolean($env.get("MERCURIOS_DEBUG", "") === "1"),
        nats_url: $env.get("NATS_URL"),
        mysql_host: $env.get("MYSQL_HOST", ""),
        mysql_port: parseInt($env.get("MYSQL_PORT", "")),
        mysql_user: $env.get("MYSQL_USER", ""),
        mysql_password: $env.get("MYSQL_PASSWORD", ""),
        mysql_database: $env.get("MYSQL_DATABASE", ""),
        mysql_rds_ssl: $env.get("MYSQL_RDS_SSL", "0"),
        mercurios_driver: $env.get("MERCURIOS_DRIVER", "mysql"),
        redis_host: $env.get("REDIS_HOST", ""),
        postgre_host: $env.get("POSTGRES_HOST", ""),
        postgre_port: $env.get("POSTGRES_PORT", ""),
        postgre_database: $env.get("POSTGRES_DB", ""),
        postgre_user: $env.get("POSTGRES_USER", ""),
        postgre_password: $env.get("POSTGRES_PASSWORD", ""),
        mercurios_ping_interval: $env.get("MERCURIOS_PORT_INTERVAL", "30000"),
    },
    {
        get<T>(_object: T, attribute: keyof T) {
            return $lodash.cloneDeep(_object[attribute]);
        },
    }
);

export default $config;
