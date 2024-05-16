import { JsonSchema } from "@bahatron/utils";
import MercuriosClient from "..";
import { MercuriosEventSchema } from "../client/event";
import { $config } from "../utils/config";

describe(`Append Event`, () => {
    let mercurios = MercuriosClient({
        url: $config.TEST_URL,
        debug: true,
    });

    describe(`Scenario: publish to non existent topic`, () => {
        let topic = `publish_event_test`;

        beforeAll(async () => {
            await mercurios.deleteTopic(topic);
            expect(await mercurios.topicExists(topic)).toBe(false);
        });

        it("creates an event", async () => {
            let data = {
                foo: "bar",
            };
            let key = "key";

            let event = await mercurios.append(topic, { data, key });

            expect(event.seq).toBe(1);
            expect(event.key).toBe(key);
            expect(event.data).toEqual(data);
            expect(() =>
                JsonSchema.validate(event, MercuriosEventSchema)
            ).not.toThrow();

            expect(await mercurios.topicExists(topic)).toBe(true);
        });
    });

    describe(`Scenario: using expectedSeq`, () => {
        let topic = "publish_with_expected_seq_test";

        beforeAll(async () => {
            await mercurios.deleteTopic(topic);
            for (let i = 0; i < 10; i++) {
                await mercurios.append(topic, { data: i + 1 });
            }
        });

        it(`throws a code 417 error if expectedSeq is ahead of seq`, async () => {
            let result = await mercurios
                .append(topic, { expectedSeq: 20 })
                .catch((err) => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.code).toBe(417);
        });

        it(`throws a code 417 error if expectedSeq is behind of seq`, async () => {
            let result = await mercurios
                .append(topic, { expectedSeq: 9 })
                .catch((err) => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.code).toBe(417);
        });

        it(`successfully creates event if expectedSeq matches next`, async () => {
            let result = await mercurios.append(topic, { expectedSeq: 11 });

            expect(result.seq).toBe(11);
        });
    });

    describe(`Scenario: optimistic locking`, () => {
        let topic = "optimistic_locking_test";
        let responses: any[] = [];

        beforeAll(async () => {
            await mercurios.deleteTopic(topic);

            for (let i of Array(10).fill(null)) {
                responses.push(
                    await mercurios
                        .append(topic, { expectedSeq: 1 })
                        .catch((err) => err)
                );
            }
        });

        it(`only allows one request to succeed`, async () => {
            let errorCount = responses.filter((item) => item instanceof Error);

            expect(errorCount).toHaveLength(9);
        });
    });
});
