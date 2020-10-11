import { connect } from "..";
import { $axios } from "../utils/axios";

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
    });

    beforeAll(async () => {
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
            let serverResponse = await $axios.get(
                `${process.env.MERCURIOS_URL}/topics?`,
                {
                    params: {
                        like: query,
                    },
                }
            );

            expect(await _client.topics({ like: query })).toEqual(
                serverResponse.data
            );
        }
    });
});
