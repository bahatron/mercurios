import $axios from "axios";
import $env from "@bahatron/env";
import $streams, {
    STREAM_DEFINITIONS,
} from "../../src/domain/modules/stream_repository";
import $domain from "../../src/domain";
import { STREAM_TABLE } from "../../src/domain/modules/stream";
import $nats from "../../src/services/nats";
import $mysql from "../../src/services/mysql";
import $assertions from "../../src/services/assertions";
import $logger from "../../src/services/logger";

const TEST_API_URL = $env.get(`TEST_API_URL`, `http://localhost:3000`);

export async function publishEvent(
    topic: string,
    data: any,
    expectedSeq?: number
) {
    return $axios.post(`${TEST_API_URL}/stream/${topic}`, {
        data,
        expectedSeq,
    });
}

describe("publish event", () => {
    describe("Scenario: simple request with no schema", () => {
        const TOPIC = `publish_event_test`;

        before(async () => {
            await $domain.createStream(TOPIC);
        });

        it("creates a record on the stream table", async () => {
            let payload = {
                foo: "bar",
            };

            let event = await publishEvent(TOPIC, payload);

            let result = await $mysql(STREAM_TABLE(TOPIC))
                .where({
                    seq: event.data.seq,
                })
                .first();

            $assertions.expect(result).not.to.be.undefined;
        });

        it("emits an event", async () => {
            return new Promise(async resolve => {
                let event: any;

                $nats.subscribe(`event_published`, (err, { data }) => {
                    if (data.topic === TOPIC) {
                        resolve(
                            $assertions.expect(data).to.deep.eq(event.data)
                        );
                    }
                });

                event = await publishEvent(TOPIC, "hello from test");
            });
        });
    });

    describe("Scenario: using schema", () => {
        const topic = `test_with_schmea`;
        const schema = {
            type: "object",
            properties: {
                test: { type: "number" },
            },
        };

        before(async () => {
            await $domain.createStream(topic, schema);
        });

        it("will publish an event if complies with the schema", async () => {
            let response = await publishEvent(topic, { test: 5 });

            $assertions.expect(response.status).to.eq(201);
        });

        it("will rejct the request if the message does not complies with the schema", async () => {
            return new Promise(async resolve => {
                try {
                    await publishEvent(topic, "invalid message");
                } catch (err) {
                    resolve($assertions.expect(err.response.status).to.eq(400));
                }
            });
        });
    });

    describe(`Scenario: using expected seq`, () => {
        let TOPIC = `publish_with_expected_seq_test`;

        before(async () => {
            try {
                await $streams.delete(TOPIC);

                await $domain.createStream(TOPIC);

                // publish event from 1 to 11
                await Promise.all(
                    [...Array(11).keys()].map(val => {
                        return publishEvent(TOPIC, val + 1);
                    })
                );
            } catch (err) {
                $logger.error(`Error loading fixtures`);
                $logger.debug(`err: `, err);
                throw err;
            }
        });

        it("will return http status coe 417 if seq number is already taken", async () => {
            return new Promise(async resolve => {
                try {
                    await publishEvent(TOPIC, "another message", 5);
                } catch (err) {
                    resolve($assertions.expect(err.response.status).to.eq(417));
                }
            });
        });

        it("will return http status coe 417 if expected sequence number is higher than actual", async () => {
            return new Promise(async resolve => {
                try {
                    await publishEvent(TOPIC, "another message", 15);
                } catch (err) {
                    resolve($assertions.expect(err.response.status).to.eq(417));
                }
            });
        });

        it("will publish the event if 'next' sequence number matches the expected", async () => {
            let response = await publishEvent(TOPIC, "12 from test", 12);

            $assertions.expect(response.data.seq).to.eq(12);
        });
    });
});
