import $ws from "ws";
import $config from "../services/config";
import $createStream from "../domain/create_stream";
import $logger from "../services/logger";
import $json from "../services/json";
import $publishEvent from "../domain/publish_event";

$createStream(`ws_client_fake`);

let client = new $ws($config.TEST_SERVER_URL);

client.on("open", () => {
    $logger.debug("client opened");

    client.on("message", data => {
        $logger.debug("client message", $json.parse(data));
    });

    client.on("ping", data => {
        $logger.debug("client ping", data);
    });

    client.send(
        $json.stringify({
            action: "subscribe",
            options: {
                topic: "ws_client_fake",
            },
        })
    );

    setInterval(() => {
        $publishEvent({ topic: "ws_client_fake" });
    }, 1000);
});
