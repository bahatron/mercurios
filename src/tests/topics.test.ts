import MercuriosClient from "..";
import { $config } from "../utils/config";

describe("List Topics", () => {
    let mercurios = MercuriosClient({
        url: $config.test_url,
        debug: true,
    });

    let _topics = [
        "list_topic_test1",
        "list_topic_test2",
        "list_topic_test3",
        "list_topic.foo.3",
        "list_topic.bar.3",
        "list_topic.foo.4",
    ];

    beforeAll(async () => {
        for (let topic of _topics) {
            await mercurios.deleteTopic(topic);
            await mercurios.append(topic);
        }
    });

    describe("no params", () => {
        it("list all topics with no filters", async () => {
            let result = await mercurios.topics();

            _topics.forEach((topic) => {
                expect(result).toContain(topic);
            });
        });
    });

    describe("using filters", () => {
        let allTopics: any[];
        beforeAll(async () => {
            allTopics = await mercurios.topics();
        });

        it("can use limit to limit results", async () => {
            let limit2Response = await mercurios.topics({
                limit: 2,
            });

            expect(limit2Response).toHaveLength(2);
            expect(limit2Response).toEqual(allTopics.slice(0, 2));
        });

        it("can use offset for pagination", async () => {
            let offsetResponse = await mercurios.topics({
                limit: 2,
                offset: 2,
            });

            expect(offsetResponse).toHaveLength(2);
            expect(offsetResponse).toEqual(allTopics.slice(2, 4));
        });

        it("filters by timestamp", async () => {
            let topic = _topics[0];
            let event = await mercurios.append(topic);

            let afterResult = await mercurios.topics({
                withEvents: { after: event.timestamp },
            });

            expect(afterResult).toHaveLength(1);
            expect(afterResult[0]).toEqual(topic);
        });

        it("using before timestamp filter", async () => {
            let beforeTopic = "before_timestamp_topic_test";
            await mercurios.deleteTopic(beforeTopic);

            let event = await mercurios.append(beforeTopic);

            let beforeResult = await mercurios.topics({
                withEvents: { before: event.timestamp },
            });

            expect(beforeResult.includes(beforeTopic)).toBeFalsy();
        });
    });
});
