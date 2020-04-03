import $ws from "ws";
import $env from "@bahatron/env";
import $logger from "@bahatron/logger";
import { publishEventEndpoint } from "../domain/publish_event.mocha";

const TEST_URL = $env.get("TEST_URL");

describe("Feature: subscribe to topic", () => {
    let _wsc: $ws;

    before(async () => {
        return new Promise(resolve => {
            _wsc = new $ws(TEST_URL);

            _wsc.on("open", () => {
                resolve();
            });
        });
    });

    /** @todo: find why second tests does not send msg to ws server */
    it("can subcribe to a topic", async () => {
        const _topic = "ws_subscribe_test";

        return new Promise(async resolve => {
            _wsc.on("message", data => {
                let payload = JSON.parse(data.toString());

                resolve(payload);
            });

            /** @todo: investigate why sometimes the message is sent before the server has stablished a connection */
            await new Promise(resolve => setTimeout(resolve, 5));

            _wsc.send(
                JSON.stringify({
                    action: "subscribe",
                    topic: _topic,
                }),
                err => {
                    if (err) {
                        return $logger.error(err);
                    }
                }
            );

            publishEventEndpoint(_topic);
        });
    });
});
