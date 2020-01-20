import $env from "@bahatron/env";
import $assertions from "../../services/assertions";
import { STREAM_DEFINITIONS } from "../../domain/modules/stream_repository";
import $json from "../../services/json";
import { STREAM_TABLE } from "../../domain/modules/stream";
import $mysql from "../../services/mysql";
import $axios from "../../services/axios";
import { AxiosResponse } from "axios";

const TEST_SERVER_URL = $env.get(`TEST_SERVER_URL`, `http://localhost:3000`);

describe("create stream", () => {
    async function createStream(topic: string, schema = {}) {
        return $axios.post(`${TEST_SERVER_URL}/streams`, { topic, schema });
    }

    describe("Scenario: valid request with no schema", () => {
        const TOPIC = `create_stream_test`;

        let RESPONSE: AxiosResponse;
        before(async () => {
            await $mysql(STREAM_DEFINITIONS).truncate();

            RESPONSE = await createStream(TOPIC);
        });

        it("responds with http 201", async () => {
            $assertions.expect(RESPONSE.status).to.eq(201);
        });

        it("responds http 200 if the stream already exists", async () => {
            let response = await createStream(TOPIC);

            $assertions.expect(response.status).to.eq(200);
        });

        it("creates a stream table", async () => {
            $assertions
                .expect(await $mysql.schema.hasTable(STREAM_TABLE(TOPIC)))
                .to.eq(true);
        });

        it("creates a stream definition record", async () => {
            let result = await $mysql(STREAM_DEFINITIONS)
                .where({ topic: TOPIC })
                .first();

            $assertions.expect(result).not.to.be.undefined;
            $assertions.expect(result.topic).to.eq(TOPIC);
            $assertions.expect($json.parse(result.schema)).to.deep.eq({});
        });
    });
});
