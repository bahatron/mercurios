import { v4 } from "uuid";
import { connect } from "..";
import { DateTime } from "luxon";
import { expect } from "chai";

describe("Feature: Filter topic", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "ping_event_test",
        debug: Boolean(process.env.MERCURIOS_DEV),
    });

    let topic: string;
    let lapTimestamp: string;
    let initTimestamp: string;

    before(async () => {
        topic = v4();

        initTimestamp = DateTime.utc().toISO();

        await Promise.all(
            [1, 2, 3, 4, 5].map(async (number) => {
                let key = number % 2 === 0 ? "pair_number" : undefined;

                await _client.publish(topic, {
                    data: number,
                    key,
                });
            })
        ).catch(console.error);

        lapTimestamp = DateTime.utc().toISO();

        await Promise.all(
            [6, 7, 8, 9, 10].map(async (number) => {
                await _client.publish(topic, { data: number });
            })
        ).catch(console.error);
    });

    it("filters by key", async () => {
        let events = await _client.filter(topic, { key: "pair_number" });

        for (let event of events) {
            expect(event.key).to.eq("pair_number");
        }
    });

    it("filters by date", async () => {
        let events = await _client.filter(topic, {
            before: lapTimestamp,
            after: initTimestamp,
        });

        for (let event of events) {
            expect(
                event.published_at >= initTimestamp &&
                    event.published_at <= lapTimestamp
            ).to.be.true;
        }
    });
});
