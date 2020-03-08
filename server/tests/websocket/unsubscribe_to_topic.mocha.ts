import $ws from "ws";
import $config from "../../services/config";
import $json from "../../services/json";
import $logger from "../../services/logger";
import $publishEvent from "../../domain/publish_event";
import { before } from "mocha";
import $createStream from "../../domain/create_stream";

describe("Feature: unsubscribe to topic", () => {
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
        const _topic = "ws_unsubscribe_test";

        await $createStream(_topic);

        await new Promise(resolve => {
            _wsc.once("message", data => {
                let payload = $json.parse(data.toString());

                $logger.debug(`ws server message payload`, payload);

                resolve(payload);
            });

            _wsc.send(
                $json.stringify({
                    action: "subscribe",
                    topic: _topic,
                }),

                err => {
                    if (err) {
                        $logger.warning(`wsc error`, err);
                    }

                    $publishEvent({
                        topic: _topic,
                    });
                }
            );
        });
    });
});
