import $ws from "../../src/http/node_modules/ws";
import $env from "@bahatron/env";
import $assertions from "../../src/services/assertions";
import $domain from "../../src/domain";
import $json from "../../src/services/json";

const TEST_API_URL = $env.get(`TEST_API_URL`, `http://localhost:3000`);

describe("websocket connection", () => {
    let TOPIC = `websocket_connection_test`;

    before(async () => {
        await $domain.createStream(TOPIC);
    });

    it("will stablish a ws connection", async () => {
        return new Promise(async resolve => {
            const client = new $ws(TEST_API_URL);

            client.on("open", () => {
                resolve();
            });
        });
    });

    it("will recieve messages when a event is published", async () => {
        return new Promise(async resolve => {
            const ws = new $ws(TEST_API_URL);

            ws.on("message", data => {
                $assertions
                    .expect($json.parse(data.toString()))
                    .to.have.all.keys(["topic", "seq", "published_at", "data"]);

                resolve(true);
            });

            await $domain.publishEvent(TOPIC, { data: "" });
        });
    });
});
