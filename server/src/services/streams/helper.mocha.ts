import { expect } from "chai";
import { natsQueryToSql } from "./helpers";

describe.only("Helper: NATs to SQL query transformation", () => {
    it("ignores everything after >", () => {
        expect(natsQueryToSql("topic.>.abc")).to.eq("topic.%");
        expect(natsQueryToSql("topic.*.abc.>")).to.eq("topic.%.abc.%");
    });

    it("converts * to %", () => {
        expect(natsQueryToSql("topic.*.abc")).to.eq("topic.%.abc");
        expect(natsQueryToSql("topic.*")).to.eq("topic.%");
    });

    it("doesn't leave trailing special characters", () => {
        expect(natsQueryToSql("topic.abc.*.>.>.*.123")).to.eq("topic.abc.%");
        expect(natsQueryToSql("topic.*.*.>.>.*.123")).to.eq("topic.%");

        expect(natsQueryToSql(">")).to.eq("%");
    });
});
