import $ws from "ws";
import $env from "@bahatron/env";
import $logger from "@bahatron/logger";
import { publishEventEndpoint } from "./publish_event.mocha";
import uuid from "uuid";

const TEST_URL = $env.get("TEST_URL");

describe("WS action: subscribe", () => {
    let _wsc: $ws;

    before(async () => {
        return new Promise((resolve) => {
            _wsc = new $ws(`${TEST_URL}?id=subscribe_test`);

            _wsc.on("open", () => {
                resolve();
            });
        });
    });

    /** @todo: find why second tests does not send msg to ws server */
    it("can subcribe to a topic", async () => {
        const _topic = "ws_subscribe_test";

        return new Promise(async (resolve) => {
            _wsc.on("message", (data) => {
                let payload = JSON.parse(data.toString());

                resolve(payload);
            });

            _wsc.send(
                JSON.stringify({
                    action: "subscribe",
                    topic: _topic,
                    subscription: uuid.v4(),
                }),
                (err) => {
                    if (err) {
                        return $logger.error(err.message, err);
                    }
                }
            );

            publishEventEndpoint(_topic);
        });
    });
});
