import $http, { AxiosResponse } from "axios";
import env from "@bahatron/env";
import { expect } from "chai";
import $logger from "@bahatron/logger";
import { publishEventEndpoint } from "./publish_event.mocha";
import $store from "../models/store";

const MERCURIOS_MERCURIOS_TEST_URL = env.get("MERCURIOS_TEST_URL");

describe("GET /read/:topic/:seq", () => {
    async function readEvent(
        topic: string,
        seq: number
    ): Promise<AxiosResponse> {
        return $http
            .get(`${MERCURIOS_MERCURIOS_TEST_URL}/read/${topic}/${seq}`)
            .catch((err) => err.response);
    }

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

        // it("has the expected schema", async () => {
        //     expect(_event).to.have.keys([
        //         "seq",
        //         "published_at",
        //         "key",
        //         "data",
        //         "topic",
        //     ]);
        // });
    });
});
