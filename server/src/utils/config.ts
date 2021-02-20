import $env from "@bahatron/env";
import $lodash from "lodash";

export const $config = new Proxy(
    {
        test_url: $env.get("MERCURIOS_TEST_URL", `http://localhost:4254`),
        dev_mode: Boolean($env.get("MERCURIOS_DEV", "") === "1"),
        debug: Boolean($env.get("MERCURIOS_DEBUG", "") === "1"),
        store_driver: $env.get(
            "MERCURIOS_STORE",
            $env.get("MERCURIOS_DRIVER", "mysql") // backwards compatability
        ),
        mercurios_ping_interval: $env.get("MERCURIOS_PING_INTERVAL", "30000"),
        mercurios_workers: $env.get("MERCURIOS_WORKERS", "1"),
        nats_url: $env.get("NATS_URL"),

        mysql_host: $env.get("MYSQL_HOST", ""),
        mysql_port: parseInt($env.get("MYSQL_PORT", "")),
        mysql_user: $env.get("MYSQL_USER", ""),
        mysql_password: $env.get("MYSQL_PASSWORD", ""),
        mysql_database: $env.get("MYSQL_DATABASE", ""),
        mysql_rds_ssl: $env.get("MYSQL_RDS_SSL", "0"),

        postgre_host: $env.get("POSTGRES_HOST", ""),
        postgre_port: $env.get("POSTGRES_PORT", ""),
        postgre_database: $env.get("POSTGRES_DB", ""),
        postgre_user: $env.get("POSTGRES_USER", ""),
        postgre_password: $env.get("POSTGRES_PASSWORD", ""),
    },
    {
        get<T>(_object: T, attribute: keyof T) {
            return $lodash.cloneDeep(_object[attribute]);
        },
    }
);
