import $axios, { AxiosResponse } from "axios";
import env from "@bahatron/env";
import { expect } from "chai";
import $event from "../models/event";
import $nats from "../utils/nats";

const MERCURIOS_TEST_URL = env.get("TEST_URL");

export async function emitEvent(topic: string, data?: any) {
    return $axios.post(`${MERCURIOS_TEST_URL}/emit/${topic}`, {
        data,
    });
}

describe("Feature: emit event", () => {
    describe("Scenario: with data", () => {
        let _topic = "emit_topic_test";
        let _data = {
            rick: "sanchez",
        };

        let _message: any;
        let _response: AxiosResponse;
        before(async () => {
            $nats.subscribe(`topic.${_topic}`, (err, msg) => {
                _message = msg.data;
            });

            _response = await emitEvent(_topic, _data);
        });

        it("responds with http 200", () => {
            expect(_response.status).to.eq(200);
        });

        it("emits a MercuriosEvent", async () => {
            expect(_message).to.exist;
            expect(() => $event(_message)).not.to.throw();
        });
    });
});
