import $ws from "ws";
import $env from "@bahatron/env";

const TEST_URL = $env.get("TEST_URL");

describe("Endpoint: websocket connection", () => {
    let _wsc: $ws;

    it("can stablish a ws connection", async () => {
        return new Promise(async resolve => {
            _wsc = new $ws(TEST_URL);

            _wsc.on("open", () => {
                return setTimeout(() => resolve(), 1);
            });
        });
    });
});
