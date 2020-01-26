import $ws from "ws";
import $config from "../../services/config";
import $createStream from "../../domain/create_stream";
import $json from "../../services/json";
import $logger from "../../services/logger";

describe("websocket connection", () => {
    before(async () => {
        await $createStream("ws_subscribe_test");
    });

    it("can stablish a ws connection", async () => {
        return new Promise(async resolve => {
            let client = new $ws($config.TEST_SERVER_URL);

            client.on("open", () => {
                $logger.debug(`is opened!`);
                resolve();
            });
        });
    });

    /** @todo */
    // it("can subcribe to a stream", async () => {
    //     return new Promise(resolve => {
    //         let wsc = new $ws($config.TEST_SERVER_URL);

    //         $logger.debug(`!!!! here`);

    //         wsc.on("open", () => {
    //             wsc.on("message", data => {
    //                 let payload = $json.parse(data.toString());

    //                 $logger.debug(`response payload`, payload);

    //                 resolve(payload);
    //             });

    //             wsc.send(
    //                 $json.stringify({
    //                     action: "subscribe",
    //                     topic: "ws_subscribe_test",
    //                 })
    //             );
    //             $logger.debug(`sent message`);
    //         });
    //     });
    // });
});
