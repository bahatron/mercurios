import $http from "../../utils/http";
import { $config } from "../../utils/config";
import { $store } from "../../models/store/store";
import publishEvent from "../../handlers/publish-event";
import { expect } from "chai";
import { $logger } from "../../utils/logger";

describe("GET /topics", () => {
    async function listTopicsEndpoint() {
        return $http
            .get(`${$config.test_url}/topics`)
            .catch((err) => err.response || $logger.error(err));
    }

    let _topics = ["list_topic_test1", "list_topic_test2", "list_topic_test3"];

    before(async () => {
        await Promise.all(
            _topics.map((topic) => publishEvent({ topic }))
        ).catch((err) => $logger.error(err));
    });

    it("lists all topics available", async () => {
        let { data } = await listTopicsEndpoint();

        expect(Array.isArray(data)).to.be.true;

        _topics.forEach((topic) => {
            expect((data as string[]).includes(topic)).to.be.true;
        });
    });
});
