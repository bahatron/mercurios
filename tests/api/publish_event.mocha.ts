import $axios from "axios";
import $env from "@bahatron/env";
import $assertions from "../../src/services/assertions";
import $db from "../../src/services/db";
import { STREAM_TABLE } from "../../src/domain/modules/stream_repository";
import $domain from "../../src/domain";
import $dispatcher from "../../src/services/dispatcher";

const TEST_API_URL = $env.get(`TEST_API_URL`, `http://localhost:3000`);

describe("publish event", () => {
    async function publishEvent(topic: string, data: any) {
        return $axios.post(`${TEST_API_URL}/stream/${topic}`, data);
    }

    describe("Scenario: valid request with no schema", () => {
        const TOPIC = `publish_event_test`;

        before(async () => {
            await $domain.createStream(TOPIC);
        });

        it("creates a record on the stream table", async () => {
            let payload = {
                foo: "bar",
            };

            let event = await publishEvent(TOPIC, payload);

            let result = $db.findOneBy(STREAM_TABLE(TOPIC), {
                id: event.data.id,
            });

            $assertions.expect(result).not.to.be.undefined;
        });

        it("emits an event", async () => {
            return new Promise(async resolve => {
                let event: any;

                $dispatcher.subscribe(STREAM_TABLE(TOPIC), (err, msg) => {
                    resolve($assertions.expect(msg).to.deep.eq(event.data));
                });

                event = await publishEvent(TOPIC, "hello from test");
            });
        });
    });
});
