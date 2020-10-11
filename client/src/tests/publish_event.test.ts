import { connect } from "..";

describe("Feature: Publish Event", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "publish_event_test",
    });

    it("can publish events", async () => {
        return new Promise(async (resolve) => {
            let testData = { rick: "sanchez" };
            let testKey = "testKey";

            let event = await _client.publish("test_publish", {
                data: testData,
                key: testKey,
            });

            expect(event).toBeTruthy();
            expect(event.seq).toBeTruthy();
            expect(event.data).toEqual(testData);
            expect(event.key).toEqual(testKey);

            resolve();
        });
    });

    describe("Scenario: with expectedSeq", () => {
        // todo
    });
});
