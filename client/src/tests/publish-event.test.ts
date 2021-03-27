import { connect } from "..";
import { expect } from "chai";

describe("Feature: Publish Event", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "publish_event_test",
        debug: true,
    });

    it("can publish events", async () => {
        let testData = { rick: "sanchez" };
        let testKey = "testKey";

        let event = await _client.publish("test_publish", {
            data: testData,
            key: testKey,
        });

        expect(Boolean(event)).to.be.true;
        expect(Boolean(event.seq)).to.be.true;
        expect(event.data).to.deep.eq(testData);
        expect(event.key).to.deep.eq(testKey);
    });

    describe("Scenario: with expectedSeq", () => {
        // todo
    });
});
