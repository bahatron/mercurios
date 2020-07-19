import client from "../client";

describe("Feature: Publish Event", () => {
    let _client = client.connect({
        url: process.env.MERCURIOS_URL || "",
        id: "publish_event_test",
    });

    it("can publish events", async () => {
        return new Promise(async (resolve) => {
            let testData = { rick: "sanchez" };

            let event = await _client.publish("test_publish", {
                data: testData,
            });

            expect(event).toBeTruthy();
            expect(event.seq).toBeTruthy();
            expect(event.data).toEqual(testData);

            resolve();
        });
    });

    describe("Scenario: with expectedSeq", () => {
        // todo
    });
});
