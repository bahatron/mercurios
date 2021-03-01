import { connect } from "..";
import { expect } from "chai";

const _topic = "client_read_event_test";

const _client = connect({
    url: process.env.MERCURIOS_URL || "",
    id: "client_read_event_test",
});

describe("Feature: Read Event", () => {
    it("can read an event", async () => {
        let data = ["dimension", "c137"];

        await _client.publish(_topic, { data });

        let event = await _client.read(_topic, 1);

        expect(Boolean(event)).to.be.true;
        expect(event?.data).to.deep.eq(data);
        expect(event?.seq).to.eq(1);
    });
});

describe("Feature: read latest event", () => {
    it("returns the latest event in a stream", async () => {
        let latest = await _client.read(_topic, "latest");

        let cursor = 0;
        let event;
        let result;

        while ((result = await _client.read(_topic, ++cursor))) {
            event = result;
        }

        expect(latest?.seq).to.eq(event?.seq);
    });
});
