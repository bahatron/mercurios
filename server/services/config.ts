import $env from "@bahatron/env";
import $lodash from "lodash";

const $config = new Proxy(
    {
        server_port: $env.get("MERCURIOS_PORT", "4254"),
        test_url: $env.get("MERCURIOS_TEST_URL", "http://server:4254"),
        dev_mode: Boolean($env.get("MERCURIOS_ENV", "") !== "production"),
        logger_id: $env.get("MERCURIOS_LOGGER_ID", ""),
        mysql: {
            host: $env.get("MYSQL_HOST"),
            port: parseInt($env.get("MYSQL_PORT")),
            user: $env.get("MYSQL_USER"),
            password: $env.get("MYSQL_PASSWORD"),
            database: $env.get("MYSQL_DATABASE"),
        },
        nats: {
            url: $env.get("NATS_URL"),
        },
    },
    {
        get<T>(_object: T, attribute: keyof T) {
            return $lodash.cloneDeep(_object[attribute]);
        },
    }
);

export default $config;
