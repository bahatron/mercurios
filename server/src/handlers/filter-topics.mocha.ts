import $http from "../utils/http";
import $config from "../utils/config";
import { $store } from "../models/store/store";
import publishEvent from "./publish-event";
import { expect } from "chai";
import { MercuriosEvent } from "../models/event/event";
import { EventFilters } from "../models/store/drivers/helpers";

async function filterTopicEndpoint(topic: string, query: EventFilters = {}) {
    return $http.get<MercuriosEvent[]>(`${$config.test_url}/filter/${topic}`, {
        params: query,
    });
}

describe("GET /filter/:topic", () => {
    let _topic = "filter_topic_test";
    let _key = "index_over_10";

    before(async () => {
        await $store.deleteStream(_topic);

        await Promise.all(
            Array(20)
                .fill(null)
                .map((value: any, index) =>
                    publishEvent({
                        topic: _topic,
                        key: index >= 10 ? _key : undefined,
                    })
                )
        );
    });

    it("returns the entire stream with no query params", async () => {
        let result = await filterTopicEndpoint(_topic);

        expect(Array.isArray(result.data)).to.true;

        expect(result.data.length).to.eq(20);
    });

    it("returns all events by key if submitted", async () => {
        let result = await filterTopicEndpoint(_topic, {
            key: _key,
        });

        result.data.forEach((event) => {
            expect(event.key).to.eq(_key);
        });
    });

    it("returns only events in the specified range", async () => {
        let result = await filterTopicEndpoint(_topic, {
            from: 5,
            to: 10,
        });

        expect(result.data.length).to.eq(6);

        expect(result.data.map((event) => event.seq).sort()).to.deep.eq([
            10,
            5,
            6,
            7,
            8,
            9,
        ]);
    });
});
