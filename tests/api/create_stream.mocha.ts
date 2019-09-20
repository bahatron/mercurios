import $axios, { AxiosResponse } from "axios";
import $env from "@bahatron/env";
import $assertions from "../../src/services/assertions";
import $db from "../../src/services/db";
import {
    STREAM_TABLE,
    STREAM_DEFINITIONS,
} from "../../src/domain/modules/stream_repository";
import $json from "../../src/services/json";

const TEST_API_URL = $env.get(`TEST_API_URL`, `http://localhost:3000`);

describe("create stream", () => {
    async function createStream(topic: string, schema = {}) {
        return $axios.post(`${TEST_API_URL}/streams`, { topic, schema });
    }

    describe("Scenario: valid request with no schema", () => {
        const TOPIC = `create_stream_test`;

        let RESPONSE: AxiosResponse;
        before(async () => {
            await $db.truncate(STREAM_DEFINITIONS);

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
                .expect(await $db.hasTable(STREAM_TABLE(TOPIC)))
                .to.eq(true);
        });

        it("creates a stream definition record", async () => {
            let result = await $db.findOneBy(STREAM_DEFINITIONS, {
                topic: TOPIC,
            });

            $assertions.expect(result).not.to.be.undefined;
            $assertions.expect(result.topic).to.eq(TOPIC);
            $assertions.expect($json.parse(result.schema)).to.deep.eq({});
        });
    });
});
