import { $axios } from "../../utils/axios";
import { $config } from "../../utils/config";
import publishEvent from "../publish-event/publish-event";
import { expect } from "chai";
import { $logger } from "../../utils/logger";
import { $store, ListTopicsOptions } from "../../store/store";

describe("GET /topics", () => {
    async function listTopicsEndpoint(params: ListTopicsOptions = {}) {
        return $axios
            .get(`${$config.test_url}/topics`, { params })
            .catch((err) => err.response || $logger.error(err));
    }

    let _timeStamp = new Date().toISOString();
    let _topics = [
        "list_topic_test1",
        "list_topic_test2",
        "list_topic_test3",
        "list_topic.foo.3",
        "list_topic.bar.3",
        "list_topic.foo.4",
    ];

    let allTopics: string[];
    before(async () => {
        // create the streams
        for (let topic of _topics) {
            await $store.deleteStream(topic);
            await publishEvent({ topic });
        }

        allTopics = await $store.topics({});
    });

    describe("no params", () => {
        it("lists all topics available", async () => {
            let { data } = await listTopicsEndpoint();

            expect(Array.isArray(data)).to.be.true;

            _topics.forEach((topic) => {
                expect((data as string[]).includes(topic)).to.be.true;
            });
        });
    });

    describe("paginate result", () => {
        it("can use limit", async () => {
            let { data: limit2Response } = await listTopicsEndpoint({
                limit: 2,
            });

            expect(limit2Response.length).to.eq(2);
            expect(limit2Response).to.deep.eq(allTopics.slice(0, 2));
        });

        it("can use offset", async () => {
            let { data: offsetResponse } = await listTopicsEndpoint({
                limit: 2,
                offset: 2,
            });

            expect(offsetResponse.length).to.eq(2);
            expect(offsetResponse).to.deep.eq(allTopics.slice(2, 4));
        });
    });

    describe("using with events", () => {
        it("filters by published at", async () => {
            let topic = _topics[0];
            let event = await publishEvent({ topic });

            let { data: afterResult } = await listTopicsEndpoint({
                withEvents: { after: event.published_at },
            });

            expect(afterResult.length).to.eq(1);
            expect(afterResult[0]).to.deep.eq(topic);

            let { data: beforeResult } = await listTopicsEndpoint({
                withEvents: { before: event.published_at },
            });

            expect(beforeResult).to.deep.eq(allTopics);
        });

        it("won't return topics without events before the 'before' query", async () => {
            let { data: response } = await listTopicsEndpoint({
                withEvents: { before: _timeStamp },
            });

            expect(_topics.every((topic) => !response.includes(topic))).to.be
                .true;
        });
    });
});
