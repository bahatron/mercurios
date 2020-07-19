import client from "../client";

describe("Feature: Emit Event", () => {
    let _client = client.connect({
        url: process.env.MERCURIOS_URL || "",
        id: "emit_event_test",
    });

    it("can emit events", async () => {
        return new Promise(async (resolve) => {
            let testData = { morty: "smith" };

            let event = await _client.emit("test_emit", { data: testData });

            expect(event).toBeTruthy();
            expect(event.seq).toBeFalsy();
            expect(event.data).toEqual(testData);

            resolve();
        });
    });
});
