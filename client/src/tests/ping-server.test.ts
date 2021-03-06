import { connect } from "..";
import { expect } from "chai";

describe("Feature: Ping server", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "ping_event_test",
        debug: Boolean(process.env.MERCURIOS_DEV),
    });

    it("can ping the server", async () => {
        expect(await _client.ping()).to.be.true;
    });
});
