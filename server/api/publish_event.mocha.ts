import $axios from "axios";
import env from "@bahatron/env";
import { expect } from "chai";
import $logger from "@bahatron/logger";
import $mysql from "../utils/knex";
import $nats from "../utils/nats";

const MERCURIOS_TEST_URL = env.get("TEST_URL");

export async function publishEventEndpoint(
    topic: string,
    data?: any,
    expectedSeq?: number
) {
    return $axios.post(`${MERCURIOS_TEST_URL}/stream/${topic}`, {
        data,
        expectedSeq,
    });
}

describe("Feature: publish event", () => {
    describe("Scenario: publish to unexistant stream", () => {
        const _topic = `publish_event_test`;

        it("creates a record on the stream table", async () => {
            try {
                let payload = {
                    foo: "bar",
                };

                let event = await publishEventEndpoint(_topic, payload);

                let result = await $mysql(`stream_${_topic}`)
                    .where({
                        seq: event.data.seq,
                    })
                    .first();

                expect(result).not.to.be.undefined;
            } catch (err) {
                $logger.error(err);
                throw err;
            }
        });

        it("emits an event related to the topic", async () => {
            return new Promise(async (resolve) => {
                let event: any;

                $nats.subscribe(`topic.${_topic}`, (err, msg) => {
                    resolve(expect(msg.data).to.deep.eq(event.data));
                });

                event = await publishEventEndpoint(_topic, "hello from test");
            });
        });
    });

    describe(`Scenario: stringified request payload`, () => {
        const _stream = "publish_double_stringified_test";

        it("level 1", async () => {
            await publishEventEndpoint(_stream, {
                data: JSON.stringify({ foo: "sanchez" }),
            });
        });

        it("level 2", async () => {
            await publishEventEndpoint(_stream, {
                data: JSON.stringify(JSON.stringify({ foo: "sanchez" })),
            });
        });

        it("level 3", async () => {
            await publishEventEndpoint(
                _stream,
                JSON.stringify({
                    data: JSON.stringify(JSON.stringify({ foo: "sanchez" })),
                })
            );
        });
    });

    describe(`Scenario: using expected seq`, () => {
        let _topic = `publish_with_expected_seq_test`;

        before(async () => {
            try {
                if (await $mysql.schema.hasTable(`stream_${_topic}`)) {
                    await $mysql(`stream_${_topic}`).truncate();
                }

                await Promise.all(
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((val) => {
                        return publishEventEndpoint(_topic, val);
                    })
                );
            } catch (err) {
                $logger.warning("error loading fixtures");
                $logger.error(err);
                throw err;
            }
        });

        it("responds with http status code 417 if seq number is already taken", async () => {
            return new Promise(async (resolve) => {
                try {
                    await publishEventEndpoint(_topic, "another message", 5);
                } catch (err) {
                    resolve(expect(err.response.status).to.eq(417));
                }
            });
        });

        it("responds with http status code 417 if expected sequence number is higher than actual", async () => {
            return new Promise(async (resolve) => {
                try {
                    await publishEventEndpoint(_topic, "another message", 15);
                } catch (err) {
                    resolve(expect(err.response.status).to.eq(417));
                }
            });
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
