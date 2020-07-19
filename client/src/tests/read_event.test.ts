import client from "../client";
import $logger from "../utils/logger";

describe("Feature: Read Event", () => {
    const _client = client.connect({
        url: process.env.MERCURIOS_URL || "",
        id: "client_read_event_test",
    });

    it("can read an event", async () => {
        let data = ["dimension", "c137"];
        let topic = "client_read_event_test";

        await _client
            .publish(topic, { expectedSeq: 1, data })
            .catch((err) => console.error(err));

        let event = await _client.read(topic, 1);

        expect(event).toBeTruthy();
        expect(event.data).toEqual(data);
        expect(event.seq).toBe(1);
    });
});
