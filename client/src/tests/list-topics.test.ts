import { connect } from "..";
import { $http } from "../utils/http";
import { expect } from "chai";

const TEST_TOPICS = [
    "test.123",
    "test.abc",
    "testy.abc",
    "testy.abc.123",
    "test.123.abc",
];

describe("Feature: List Topics", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "ping_event_test",
        debug: true,
    });

    before(async () => {
        await Promise.all(TEST_TOPICS.map((topic) => _client.publish(topic)));
    });

    it("behaves the same was as the server", async () => {
        let queries = [
            "test&",
            "test*",
            "testy.>",
            "testy.*.abc",
            "test.abc",
            "test.>",
        ];

        for (let query of queries) {
            let serverResponse = await $http.get(
                `${process.env.MERCURIOS_URL}/topics?`,
                {
                    params: {
                        like: query,
                    },
                }
            );

            expect(await _client.topics({ like: query })).to.deep.eq(
                serverResponse.data
            );
        }
    });
});
