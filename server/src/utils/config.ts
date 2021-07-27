import { getenv } from "@bahatron/utils/lib/helpers/env";
import { cloneDeep } from "lodash";

export const $config = new Proxy(
    {
        test_url: getenv("MERCURIOS_TEST_URL", `http://localhost:4254`),
        dev_mode: Boolean(getenv("MERCURIOS_DEV", "") === "1"),
        debug: Boolean(getenv("MERCURIOS_DEBUG", "") === "1"),
        store_driver: getenv(
            "MERCURIOS_STORE",
            getenv("MERCURIOS_DRIVER", "mysql") // backwards compatibility
        ),
        mercurios_ping_interval: getenv("MERCURIOS_PING_INTERVAL", "30000"),
        mercurios_workers: getenv("MERCURIOS_WORKERS", "1"),
        nats_url: getenv("NATS_URL"),

        mysql_host: getenv("MYSQL_HOST", ""),
        mysql_port: parseInt(getenv("MYSQL_PORT", "")),
        mysql_user: getenv("MYSQL_USER", ""),
        mysql_password: getenv("MYSQL_PASSWORD", ""),
        mysql_database: getenv("MYSQL_DATABASE", ""),
        mysql_rds_ssl: getenv("MYSQL_RDS_SSL", "0"),

        postgre_host: getenv("POSTGRES_HOST", ""),
        postgre_port: getenv("POSTGRES_PORT", ""),
        postgre_database: getenv("POSTGRES_DB", ""),
        postgre_user: getenv("POSTGRES_USER", ""),
        postgre_password: getenv("POSTGRES_PASSWORD", ""),

        mongo_url: getenv("MONGO_URL", ""),
        mongo_set: getenv("MONGO_REPLICA_SET", ""),
    },
    {
        get<T>(_object: T, attribute: keyof T) {
            return cloneDeep(_object[attribute]);
        },
    }
);
