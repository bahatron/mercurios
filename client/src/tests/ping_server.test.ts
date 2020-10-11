import { connect } from "..";

describe("Feature: Ping server", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "ping_event_test",
    });

    it("can ping the server", async () => {
        expect(await _client.ping()).toBeTruthy();
    });
});
