import { connect } from "..";
import { expect } from "chai";

describe("Feature: Emit Event", () => {
    let _client = connect({
        url: `${process.env.MERCURIOS_URL}` || "",
        id: "emit_event_test",
    });

    it("can emit events", async () => {
        return new Promise<void>(async (resolve) => {
            let testData = { morty: "smith" };
            let event = await _client.emit("test_emit", { data: testData });

            expect(event).to.be.true;
            expect(event.seq).to.be.false;
            expect(event.data).to.deep.eq(testData);

            resolve();
        });
    });
});
