import { connect } from "..";
import { expect } from "chai";

describe("Feature: Read Event", () => {
    const _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "client_read_event_test",
    });

    it("can read an event", async () => {
        let data = ["dimension", "c137"];
        let topic = "client_read_event_test";

        await _client
            .publish(topic, { expectedSeq: 1, data })
            .catch((err) => (err.httpCode === 417 ? err : console.error(err)));

        let event = await _client.read(topic, 1);

        expect(event).to.be.true;
        expect(event?.data).to.deep.eq(data);
        expect(event?.seq).to.eq(1);
    });
});
