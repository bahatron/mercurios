import $axios from "../../src/adapters/axios";
import { AxiosResponse } from "axios";
import $mocha from "../settings.mocha";
import $env from "../../src/adapters/env";
import $domain from "../../src/domain";

const TEST_API_URL = $env.get("TEST_API_URL", "http://localhost:3000");

describe("Read stream endpoint", () => {
    describe("Scenario: valid request", () => {
        const TOPIC = "read_event_http_valid_request_test";

        async function validRequest(topic: string, seq: number) {
            return $axios.get(`${TEST_API_URL}/stream/${topic}/${seq}`);
        }

        let SEQ: number;
        let RESPONSE: AxiosResponse<any>;
        before(async () => {
            await $domain.streams.create(TOPIC);
            let event = await $domain.publishEvent(TOPIC);

            SEQ = event.seq;

            RESPONSE = await validRequest(TOPIC, SEQ);
        });

        it("returns the expected event", async () => {
            $mocha
                .expect(RESPONSE.data)
                .to.deep.eq(await $domain.readEvent(TOPIC, SEQ));
        });

        it("returns http status code 200", async () => {
            $mocha.expect(RESPONSE.status).to.eq(200);
        });
    });
});
