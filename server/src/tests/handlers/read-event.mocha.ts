import $http, { AxiosResponse } from "axios";
import { expect } from "chai";
import { publishEventEndpoint } from "./publish-event.mocha";
import { $store } from "../../models/store/store";
import { $validator } from "../../utils/validator";
import { EventSchema } from "../../models/event/event.schema";
import publishEvent from "../../handlers/publish-event";
import filterTopic from "../../handlers/filter-topic";
import { $config } from "../../utils/config";
import { $logger } from "../../utils/logger";

const MERCURIOS_MERCURIOS_TEST_URL = $config.test_url;

async function readEvent(
    topic: string,
    seq: "latest" | number
): Promise<AxiosResponse> {
    return $http
        .get(`${MERCURIOS_MERCURIOS_TEST_URL}/read/${topic}/${seq}`)
        .catch((err) => err.response);
}

describe("GET /read/:topic/:seq", () => {
    describe("Scenario: topic does not exist", () => {
        const _topic = `non_existent_topic`;
        before(async () => {
            await $store.deleteStream(_topic);
        });

        it("responds with http 404", async () => {
            let response = await readEvent(_topic, 2);

            expect(response.status).to.eq(404);
        });
    });

    describe("Scenario: topic exists but event does not", () => {
        const _topic = `server_read_event_test`;
        let _response: AxiosResponse;

        before(async () => {
            try {
                await $store.deleteStream(_topic);

                await publishEventEndpoint(_topic, { data: "hello" });
                _response = await readEvent(_topic, 2);
            } catch (err) {
                $logger.error(err);
                throw err;
            }
        });

        it("responds with http 404", () => {
            expect(_response.status).to.eq(404);
        });

        it("response payload is empty", async () => {
            expect(Boolean(_response.data)).to.be.false;
        });
    });

    describe("Scenario: topic and event exists", () => {
        const _topic = `server_read_event_test`;
        let _event: any;

        before(async () => {
            try {
                _event = (
                    await publishEventEndpoint(_topic, {
                        data: { rick: "sanchez" },
                    })
                ).data;
            } catch (err) {
                $logger.error(err);
                throw err;
            }
        });

        it("responds with an event", async () => {
            let response = await readEvent(_topic, _event.seq);

            expect(response.data).to.deep.eq(_event);
        });

        it("has the expected schema", async () => {
            expect($validator.jsonSchema(_event, EventSchema).length).to.eq(0);
        });
    });

    describe("Scenario: latest sequence", () => {
        const _topic = "server_read_latest_event_test";

        before(async () => {
            await Promise.all(
                Array(10)
                    .fill(null)
                    .map(() => publishEvent({ topic: _topic }))
            );
        });

        it("returns the latest event for a topic", async () => {
            let latestOnStream = await (await filterTopic(_topic)).pop();
            let latest = (await readEvent(_topic, "latest")).data;

            expect(latest.seq).to.eq(latestOnStream?.seq);
        });
    });
});
