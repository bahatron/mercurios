import $http, { AxiosResponse } from "axios";
import { expect } from "chai";
import $event from "../../models/event/event";
import $nats from "../../services/nats";
import { $config } from "../../utils/config";

const MERCURIOS_TEST_URL = $config.test_url;

export async function emitEvent(topic: string, data?: any) {
    return $http.post(`${MERCURIOS_TEST_URL}/emit/${topic}`, {
        data,
    });
}

describe("POST /emit/:topic", () => {
    describe("Scenario: with data", () => {
        let _topic = "emit_topic_test";
        let _data = {
            rick: "sanchez",
        };

        let _message: any;
        let _response: AxiosResponse;
        before(async () => {
            return new Promise<void>(async (resolve) => {
                await $nats.subscribe(
                    `mercurios.topic.${_topic}`,
                    (err, msg) => {
                        _message = msg.data;
                        resolve();
                    }
                );

                _response = await emitEvent(_topic, _data);
            });
        });

        it("responds with http 200", () => {
            expect(_response.status).to.eq(200);
        });

        it("emits a MercuriosEvent", async () => {
            expect(_message.event).to.exist;
            expect(() => $event(_message.event)).not.to.throw();
        });
    });
});
