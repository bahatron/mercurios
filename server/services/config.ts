import $env from "@bahatron/env";

const $config = Object.freeze({
    MERCURIOS_TEST_URL: $env.get(`MERCURIOS_TEST_URL`, `http://localhost:3000`),
    DEV_MODE: Boolean($env.get("MERCURIOS_ENV", "") !== "production"),
    TEST_URL: $env.get("MERCURIOS_TEST_URL", "http://localhost:3000"),
    MYSQL: {
        host: $env.get("MYSQL_HOST", "mysql"),
        port: parseInt($env.get("MYSQL_PORT", "3306")),
        user: $env.get("MYSQL_USER", "root"),
        password: $env.get("MYSQL_PASSWORD", "secret"),
        database: $env.get("MYSQL_DATABASE", "mercurios"),
    },
    NATS: {
        url: $env.get("NATS_URL", "nats://nats:4222"),
    },
});

export default $config;
