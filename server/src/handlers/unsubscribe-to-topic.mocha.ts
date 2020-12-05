import $ws from "ws";
import $logger from "@bahatron/logger";
import { publishEventEndpoint } from "./publish-event.mocha";
import $config from "../utils/config";

const MERCURIOS_TEST_URL = $config.test_url;

describe("WS action: unsubscribe", () => {
    let _wsc: $ws;

    before(async () => {
        return new Promise((resolve) => {
            _wsc = new $ws(`${MERCURIOS_TEST_URL}?id=unsubscribe_test`);

            _wsc.on("open", async () => {
                resolve();
            });
        });
    });

    it("will stop receiving messages after unsubscribing", async () => {
        const _topic = "ws_unsubscribe_test";
        const _subscription = "ws_unsubscribe_test";

        // first subscribe to a topic
        await new Promise((resolve) => {
            _wsc.once("message", (data) => {
                resolve();
            });

            _wsc.send(
                JSON.stringify({
                    action: "subscribe",
                    topic: _topic,
                    subscription: _subscription,
                }),

                (err) => {
                    if (err) {
                        $logger.warning(`wsc error`, err);
                    }

                    publishEventEndpoint(_topic);
                }
            );
        });

        // then unsubscribe and validate we don't get a new message
        return new Promise(async (resolve, reject) => {
            _wsc.once("message", (data) => {
                reject(new Error("should not receive a message"));
            });

            _wsc.send(
                JSON.stringify({
                    action: "unsubscribe",
                    subscription: _subscription,
                }),

                (err) => {
                    if (err) {
                        $logger.warning(`wsc error`, err);
                    }

                    publishEventEndpoint(_topic);

                    setTimeout(resolve, 500);
                }
            );
        });
    });
});
