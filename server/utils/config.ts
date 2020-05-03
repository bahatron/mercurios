import $env from "@bahatron/env";
import $lodash from "lodash";

const $config = new Proxy(
    {
        server_port: $env.get("MERCURIOS_PORT", "4254"),
        test_url: $env.get("MERCURIOS_TEST_URL", "http://server:4254"),
        dev_mode: Boolean($env.get("NODE_ENV", "") !== "production"),
        debug: Boolean(
            ["true", "1"].includes(process.env.MERCURIOS_DEBUG || "")
        ),
        nats_url: $env.get("NATS_URL"),
        mysql_host: $env.get("MYSQL_HOST"),
        mysql_port: parseInt($env.get("MYSQL_PORT")),
        mysql_user: $env.get("MYSQL_USER"),
        mysql_password: $env.get("MYSQL_PASSWORD"),
        mysql_database: $env.get("MYSQL_DATABASE"),
        store_driver: $env.get("MERCURIOS_DRIVER", "mysql_multitable"),
        redis_host: $env.get("REDIS_HOST", "")
    },
    {
        get<T>(_object: T, attribute: keyof T) {
            return $lodash.cloneDeep(_object[attribute]);
        },
    }
);

export default $config;
