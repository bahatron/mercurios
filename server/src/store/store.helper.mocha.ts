import { expect } from "chai";
import { natsQueryToSql } from "./store.helpers";

describe("Helper: NATs to SQL query transformation", () => {
    it("ignores everything after >", () => {
        expect(natsQueryToSql("tapity.>.abc")).to.eq("tapity.%");
        expect(natsQueryToSql("tapity.*.abc.>")).to.eq("tapity.%.abc.%");
    });

    it("converts * to %", () => {
        expect(natsQueryToSql("tapity.*.abc")).to.eq("tapity.%.abc");
        expect(natsQueryToSql("tapity.*")).to.eq("tapity.%");
    });

    it("doesn't leave trailing special characters", () => {
        expect(natsQueryToSql("tapity.abc.*.>.>.*.123")).to.eq("tapity.abc.%");
        expect(natsQueryToSql("tapity.*.*.>.>.*.123")).to.eq("tapity.%");

        expect(natsQueryToSql(">")).to.eq("%");
    });
});
