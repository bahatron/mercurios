import $assertions from "../../services/assertions";
import {
    STREAM_DEFINITIONS,
    streamTable,
} from "../../domain/modules/stream_repository";
import $json from "../../services/json";
import $mysql from "../../services/mysql";
import $axios from "../../services/axios";
import { AxiosResponse } from "axios";
import $config from "../../services/config";

const MERCURIOS_TEST_URL = $config.test_url;

describe("Feature: create stream", () => {
    async function _createStream(topic: string, schema = {}) {
        return $axios.post(`${MERCURIOS_TEST_URL}/streams`, { topic, schema });
    }

    describe("Scenario: valid request with no schema", () => {
        const TOPIC = `create_stream_test`;

        let RESPONSE: AxiosResponse;
        before(async () => {
            await $mysql(STREAM_DEFINITIONS).truncate();

            RESPONSE = await _createStream(TOPIC);
        });

        it("responds with http 201", async () => {
            $assertions.expect(RESPONSE.status).to.eq(201);
        });

        it("responds http 200 if the stream already exists", async () => {
            let response = await _createStream(TOPIC);

            $assertions.expect(response.status).to.eq(200);
        });

        it("creates a stream table", async () => {
            $assertions
                .expect(await $mysql.schema.hasTable(streamTable(TOPIC)))
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
