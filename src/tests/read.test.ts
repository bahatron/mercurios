import { JsonSchema } from "@bahatron/utils";
import MercuriosClient from "..";
import { MercuriosEventSchema } from "../client/event";
import { $config } from "../utils/config";

describe("Read Event", () => {
    let mercurios = MercuriosClient({
        url: $config.TEST_URL,
        debug: true,
    });

    describe(`Scenario: unexistent topic`, () => {
        let topic = `non_existent_topic`;

        beforeAll(async () => {
            await mercurios.deleteTopic(topic);
        });

        it("responds with undefined", async () => {
            let response = await mercurios.read(topic, 2);

            expect(response).toBe(undefined);
        });
    });

    describe(`Scenario: topic exists but event doesn't`, () => {
        let topic = `non_existent_event`;

        beforeAll(async () => {
            await mercurios.deleteTopic(topic);

            await mercurios.append(topic);
        });

        it(`responds with undefined`, async () => {
            let response = await mercurios.read(topic, 2);

            expect(response).toBe(undefined);
        });
    });

    describe(`Scenario: topic and event exists`, () => {
        let topic = `read_existing_event_test`;

        beforeAll(async () => {
            await mercurios.deleteTopic(topic);
            await mercurios.append(topic);
        });

        it(`responds with a mercurios event`, async () => {
            let event = await mercurios.read(topic, 1);

            expect(() =>
                JsonSchema.validate(event, MercuriosEventSchema)
            ).not.toThrow();
        });
    });

    describe("Scenario: latest sequence", () => {
        let topic = "read_latest_event_test";

        beforeAll(async () => {
            await mercurios.deleteTopic(topic);

            await Promise.all(
                Array(10)
                    .fill(null)
                    .map(() => mercurios.append(topic))
            );
        });

        it("returns the latest event for a topic", async () => {
            let latest = await mercurios.read(topic, "latest");

            expect(latest!.seq).toBe(10);
        });
    });
});
