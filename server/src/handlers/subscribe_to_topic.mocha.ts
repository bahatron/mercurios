import $ws from "ws";
import $logger from "@bahatron/logger";
import { publishEventEndpoint } from "./publish_event.mocha";
import uuid from "uuid";
import $config from "../utils/config";

const MERCURIOS_TEST_URL = $config.test_url;

describe("WS action: subscribe", () => {
    let _wsc: $ws;

    before(async () => {
        return new Promise((resolve) => {
            _wsc = new $ws(`${MERCURIOS_TEST_URL}?id=subscribe_test`);

            _wsc.on("open", () => {
                resolve();
            });
        });
    });

    it("can subscribe to a topic", async () => {
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
                        return $logger.error(err);
                    }
                }
            );

            publishEventEndpoint(_topic);
        });
    });
});
