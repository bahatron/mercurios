import $http, { AxiosResponse } from "axios";
import { expect } from "chai";
import $nats from "../../services/nats";
import { MercuriosEvent } from "../../models/event";
import { $store } from "../../store/store";
import { $config } from "../../utils/config";
import { $logger } from "../../utils/logger";

const MERCURIOS_MERCURIOS_TEST_URL = $config.test_url;

export async function publishEventEndpoint(
    topic: string,
    options: {
        data?: any;
        expectedSeq?: number;
        key?: string;
    } = {}
): Promise<AxiosResponse> {
    return $http
        .post(`${MERCURIOS_MERCURIOS_TEST_URL}/publish/${topic}`, {
            data: options.data,
            expectedSeq: options.expectedSeq,
            key: options.key,
        })
        .catch((err) => err.response);
}

describe("POST /publish/:topic", () => {
    describe("Scenario: publish to non existent stream", () => {
        const _topic = `publish_event_test`;
        let _response: AxiosResponse;
        let _message: { event: MercuriosEvent };

        before(async () => {
            await $store.deleteStream(_topic);

            expect(await $store.streamExists(_topic)).to.be.false;

            _message = await new Promise<any>((resolve) => {
                $nats
                    .subscribe(`mercurios.topic.${_topic}`, (err, msg) => {
                        resolve(msg.data);
                    })
                    .then(async () => {
                        _response = await publishEventEndpoint(_topic, {
                            data: { foo: "bar" },
                            key: "hello_from_publish",
                        });
                    });
            });
        });

        it("responds with http 201", () => {
            expect(_response.status).to.eq(201);
        });

        it("creates and stores an event", async () => {
            let event = await $store.read(_topic, _response.data.seq);

            expect(event).to.exist;
            expect(event).to.deep.eq(_response.data);
        });

        it("emits an event with the same http response", async () => {
            expect(_message.event).to.deep.eq(_response.data);
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

                for (let i = 0; i < 11; i++) {
                    await publishEventEndpoint(_topic, {
                        data: i + 1,
                    });
                }
            } catch (err) {
                $logger.warning("error loading fixtures");
                $logger.error(err);
                throw err;
            }
        });

        it("responds with http status code 417 if seq number is already taken", async () => {
            let response = await publishEventEndpoint(_topic, {
                data: "another message",
                expectedSeq: 15,
            });
            expect(response.status).to.eq(417);
        });

        it("responds with http status code 417 if expected sequence number is higher than actual", async () => {
            let response = await publishEventEndpoint(_topic, {
                data: "another message",
                expectedSeq: 15,
            });
            expect(response.status).to.eq(417);
        });

        it("publishes the event if 'next' sequence number matches the expected", async () => {
            let response = await publishEventEndpoint(_topic, {
                data: {
                    rick: "sanchez",
                },
                expectedSeq: 12,
            });

            expect(response.data.seq).to.eq(12);
        });
    });

    describe("Scenario: concurrent requests optimistic locking", () => {
        it(`only allows one concurrent request to publish the event`, async () => {
            const topic = "optimistic_locking_test";
            await $store.deleteStream(topic);

            // let responses = await Promise.all(
            //     Array(10)
            //         .fill(null)
            //         .map(async () =>
            //             publishEventEndpoint(topic, { expectedSeq: 1 })
            //         )
            // );

            let responses = [];

            for (let i of Array(10).fill(null)) {
                responses.push(
                    await publishEventEndpoint(topic, { expectedSeq: 1 })
                );
            }

            expect(
                responses.filter((response) => response.status === 201).length
            ).to.eq(1);

            expect(
                responses.filter((response) => response.status !== 201).length
            ).to.eq(responses.length - 1);
        });
    });

    describe("Scenario: using key", () => {
        let _topic = "using.key.test";
        let _data = "foo";
        let _key = "my-key";
        let _response: AxiosResponse;

        before(async () => {
            _response = await publishEventEndpoint(_topic, {
                data: _data,
                key: _key,
            });
        });

        it("stores the key", () => {
            expect(_response.data.key).to.eq(_key);
        });
    });
});
