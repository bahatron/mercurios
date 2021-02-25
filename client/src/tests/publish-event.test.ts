import { connect } from "..";
import { expect } from "chai";

describe("Feature: Publish Event", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "publish_event_test",
    });

    it("can publish events", async () => {
        return new Promise<void>(async (resolve) => {
            let testData = { rick: "sanchez" };
            let testKey = "testKey";

            let event = await _client.publish("test_publish", {
                data: testData,
                key: testKey,
            });

            expect(event).to.be.true;
            expect(event.seq).to.be.true;
            expect(event.data).to.deep.eq(testData);
            expect(event.key).to.deep.eq(testKey);

            resolve();
        });
    });

    describe("Scenario: with expectedSeq", () => {
        // todo
    });
});
