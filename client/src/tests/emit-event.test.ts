import { connect } from "..";
import { expect } from "chai";

describe("Feature: Emit Event", () => {
    let _client = connect({
        url: `${process.env.MERCURIOS_URL}` || "",
        id: "emit_event_test",
    });

    it("can emit events", async () => {
        let testData = { morty: "smith" };
        let event = await _client.emit("test_emit", { data: testData });

        expect(Boolean(event)).to.be.true;
        expect(event.seq).to.eq(undefined);
        expect(event.data).to.deep.eq(testData);
    });
});
