import $axios, { AxiosResponse } from "axios";
import $assertions from "../../services/assertions";
import $streams from "../../domain/modules/stream_repository";
import $publishEvent from "../../domain/publish_event";
import $config from "../../services/config";
import { MercuriosEvent } from "../../domain/modules/event";
import { _publishEvent } from "./publish_event.mocha";

const MERCURIOS_TEST_URL = $config.test_url;

describe("Feature: read event", () => {
    async function readEvent(topic: string, id: number) {
        return $axios.get(`${MERCURIOS_TEST_URL}/stream/${topic}/${id}`);
    }

    describe("Scenario: topic does not exist", () => {
        it("responds with http 404", async () => {
            return new Promise(async resolve => {
                readEvent(`non_existant_topic`, 2).catch(err => {
                    resolve($assertions.expect(err.response.status).to.eq(404));
                });
            });
        });
    });

    describe("Scenario: topic exists but event does not", () => {
        const TOPIC = `read_event_test`;
        let _response: AxiosResponse;

        before(async () => {
            await $streams.delete(TOPIC);
            await _publishEvent(TOPIC, "hello", 1);
            _response = await readEvent(TOPIC, 2);
        });

        it("responds with http 204", () => {
            $assertions.expect(_response.status).to.eq(204);
        });

        it("response payload is empty", async () => {
            $assertions.expect(Boolean(_response.data)).to.be.false;
        });
    });

    describe("Scenario: topic and event exists", () => {
        const TOPIC = `read_event_test`;

        let EVENT: MercuriosEvent;
        before(async () => {
            EVENT = await $publishEvent({
                topic: TOPIC,
                data: ["npm", "start"],
            });
        });

        it("responds with an event", async () => {
            let response = await readEvent(TOPIC, EVENT.seq);

            $assertions.expect(response.data).to.deep.eq(EVENT);
        });

        it("has the expected schema", async () => {
            $assertions
                .expect(EVENT)
                .to.have.all.keys(["seq", "published_at", "data", "topic"]);
        });
    });
});
