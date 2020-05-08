import $axios, { AxiosResponse } from "axios";
import env from "@bahatron/env";
import { expect } from "chai";
import $logger from "@bahatron/logger";
import $nats from "../utils/nats";
import $store from "../models/store";
import { MercuriosEvent } from "../models/event";
import { SubscriptionOptions } from "ts-nats";

const MERCURIOS_TEST_URL = env.get("TEST_URL");

export async function publishEventEndpoint(
    topic: string,
    data?: any,
    expectedSeq?: number
): Promise<AxiosResponse> {
    return $axios
        .post(`${MERCURIOS_TEST_URL}/publish/${topic}`, {
            data,
            expectedSeq,
        })
        .catch((err) => err.response);
}

describe("Feature: publish event", () => {
    describe("Scenario: publish to non existent stream", () => {
        const _topic = `publish_event_test`;
        let _response: AxiosResponse;
        let _event: MercuriosEvent;

        before(async () => {
            await $store.deleteStream(_topic);

            expect(await $store.streamExists(_topic)).to.be.false;

            [_event, _response] = await Promise.all([
                new Promise<any>((resolve) => {
                    $nats.subscribe(`topic.${_topic}`, (err, msg) => {
                        resolve(msg);
                    });
                }),
                publishEventEndpoint(_topic, { foo: "bar" }),
            ]);
        });

        it("responds with http 201", () => {
            expect(_response.status).to.eq(201);
        });

        it("creates and stores an event", async () => {
            let event = await $store.fetch(_topic, _response.data.seq);

            expect(event).to.exist;
            expect(event).to.deep.eq(_response.data);
        });

        it("emits an event with the same http response", async () => {
            expect(_event.data).to.deep.eq(_response.data);
        });

        it("creates a stream", async () => {
            expect(await $store.streamExists(_topic)).to.be.true;
        });
    });

    describe(`Scenario: using expected seq`, () => {
        let _topic = `publish_with_expected_seq_test`;

        before(async () => {
            try {
                await $store.deleteStream(_topic);

                await Promise.all(
                    Array(11)
                        .fill(null)
                        .map((val, index) => {
                            return publishEventEndpoint(_topic, index + 1);
                        })
                );
            } catch (err) {
                $logger.warning("error loading fixtures");
                $logger.error(err);
                throw err;
            }
        });

        it("responds with http status code 417 if seq number is already taken", async () => {
            let response = await publishEventEndpoint(
                _topic,
                "another message",
                15
            );
            expect(response.status).to.eq(417);
        });

        it("responds with http status code 417 if expected sequence number is higher than actual", async () => {
            let response = await publishEventEndpoint(
                _topic,
                "another message",
                15
            );
            expect(response.status).to.eq(417);
        });

        it("publishes the event if 'next' sequence number matches the expected", async () => {
            let response = await publishEventEndpoint(
                _topic,
                "12 from test",
                12
            );

            expect(response.data.seq).to.eq(12);
        });
    });
});
