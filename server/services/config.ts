import $env from "@bahatron/env";

const $config = {
    TEST_SERVER_URL: $env.get(`TEST_SERVER_URL`, `http://localhost:3000`),
};

export default $config;
