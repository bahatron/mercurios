import $ws from "ws";
import $env from "@bahatron/env";
import $logger from "@bahatron/logger";
import { publishEventEndpoint } from "../domain/publish_event.mocha";

const TEST_URL = $env.get("TEST_URL");

describe("Feature: unsubscribe to topic", () => {
    let _wsc: $ws;

    before(async () => {
        return new Promise(resolve => {
            _wsc = new $ws(TEST_URL);

            _wsc.on("open", async () => {
                resolve();
            });
        });
    });

    it("will stop recieving messages after unsubscribing", async () => {
        const _topic = "ws_unsubscribe_test";

        // first subscribe to a topic
        await new Promise(resolve => {
            _wsc.once("message", data => {
                resolve();
            });

            _wsc.send(
                JSON.stringify({
                    action: "subscribe",
                    topic: _topic,
                }),

                err => {
                    if (err) {
                        $logger.warning(`wsc error`, err);
                    }

                    publishEventEndpoint(_topic);
                }
            );
        });

        // then unsubscribe and validate we don't get a new message
        return new Promise(async (resolve, reject) => {
            _wsc.once("message", data => {
                reject(new Error("should not recieve a message"));
            });

            _wsc.send(
                JSON.stringify({
                    action: "unsubscribe",
                    topic: _topic,
                }),

                err => {
                    if (err) {
                        $logger.warning(`wsc error`, err);
                    }

                    setTimeout(resolve, 500);

                    publishEventEndpoint(_topic);
                }
            );
        });
    });
});
