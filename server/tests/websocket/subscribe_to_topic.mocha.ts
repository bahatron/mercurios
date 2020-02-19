import $ws from "ws";
import $config from "../../services/config";
import $json from "../../services/json";
import $logger from "../../services/logger";
import $publishEvent from "../../domain/publish_event";
import { before } from "mocha";
import $createStream from "../../domain/create_stream";

describe("Feature: subscribe to topic", () => {
    let _wsc: $ws;

    before(async () => {
        return new Promise(resolve => {
            _wsc = new $ws($config.test_url);

            _wsc.on("open", () => {
                resolve();
            });
        });
    });

    /** @todo: find why second tests does not send msg to ws server */
    it("can subcribe to a topic", async () => {
        const _topic = "ws_subscribe_test";

        await $createStream(_topic);

        return new Promise(resolve => {
            _wsc.on("message", data => {
                let payload = $json.parse(data.toString());

                $logger.debug(`ws server message payload`, payload);

                resolve(payload);
            });

            _wsc.send(
                $json.stringify({
                    action: "subscribe",
                    options: {
                        topic: _topic,
                    },
                }),

                err => {
                    if (err) {
                        $logger.warning(`wsc error`, err);
                    }
                }
            );

            $publishEvent({
                topic: _topic,
            });
        });
    });
});
