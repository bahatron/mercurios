import $axios from "../../src/adapters/axios";
import $env from "../../src/adapters/env";
import { Event } from "../../src/domain/events/event_factory";
import { AxiosResponse } from "axios";
import $domain from "../../src/domain";
import $mocha from "../settings.mocha";

describe("Publish event endpoint", () => {
    const TEST_API_URL = $env.get("TEST_API_URL", "http://localhost:3000");

    async function endpoint(topic: string, payload: any) {
        return $axios.post(`${TEST_API_URL}/stream/${topic}`, payload);
    }

    describe("Scenario: valid request", () => {
        const TOPIC = "publish_event_valid_request_test";

        const PAYLOAD = {
            data: {
                foo: "bar"
            }
        };

        let RESPONSE: AxiosResponse<any>;
        before(async () => {
            await $domain.streams.create(TOPIC);

            RESPONSE = await endpoint(TOPIC, PAYLOAD);
        });

        it("publishes an event", async () => {
            let { data }: any = RESPONSE;

            let event = await $domain.readEvent(TOPIC, data.seq);

            $mocha.expect(data).to.deep.eq(event);

            $mocha.expect((event as Event).data).to.deep.eq(PAYLOAD.data);
        });

        it("returns http status code 201", async () => {
            $mocha.expect(RESPONSE.status).to.eq(201);
        });
    });
});
