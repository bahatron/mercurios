import { $axios } from "../../utils/axios";
import { $config } from "../../utils/config";
import publishEvent from "../publish-event/publish-event";
import { expect } from "chai";
import { $logger } from "../../utils/logger";

describe("GET /topics", () => {
    async function listTopicsEndpoint() {
        return $axios
            .get(`${$config.test_url}/topics`)
            .catch((err) => err.response || $logger.error(err));
    }

    let _topics = ["list_topic_test1", "list_topic_test2", "list_topic_test3"];

    before(async () => {
        for (let topic of _topics) {
            await publishEvent({ topic });
        }
    });

    it("lists all topics available", async () => {
        let { data } = await listTopicsEndpoint();

        expect(Array.isArray(data)).to.be.true;

        _topics.forEach((topic) => {
            expect((data as string[]).includes(topic)).to.be.true;
        });
    });
});
