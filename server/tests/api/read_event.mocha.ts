import $axios from "axios";
import $assertions from "../../services/assertions";
import { Event } from "../../domain/modules/event";
import $streams from "../../domain/modules/stream_repository";
import $createStream from "../../domain/create_stream";
import $publishEvent from "../../domain/publish_event";
import $config from "../../services/config";

const MERCURIOS_TEST_URL = $config.MERCURIOS_TEST_URL;

describe("read event", () => {
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

        before(async () => {
            await $streams.delete(TOPIC);

            await $createStream(TOPIC);
        });

        it("responds with http 200", async () => {
            let response = await readEvent(TOPIC, 2);

            $assertions.expect(Boolean(response.data)).to.be.false;
        });
    });

    describe("Scenario: topic and event exists", () => {
        const TOPIC = `read_event_test`;

        let EVENT: Event;
        before(async () => {
            await $createStream(TOPIC);
            EVENT = await $publishEvent({
                topic: TOPIC,
                data: ["npm", "start"],
            });
        });

        it("has the expected schema", async () => {
            $assertions
                .expect(EVENT)
                .to.have.all.keys(["seq", "published_at", "data", "topic"]);
        });

        it("returns an event", async () => {
            let response = await readEvent(TOPIC, EVENT.seq);

            $assertions.expect(response.data).to.deep.eq(EVENT);
        });
    });
});
