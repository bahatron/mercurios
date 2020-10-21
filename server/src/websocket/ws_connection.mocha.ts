import $ws from "ws";
import $config from "../utils/config";

const MERCURIOS_TEST_URL = $config.test_url;

describe("Feature: websocket connection", () => {
    let _wsc: $ws;

    it("can stablish a ws connection", async () => {
        return new Promise(async (resolve) => {
            _wsc = new $ws(`${MERCURIOS_TEST_URL}?id=connection_test`);

            _wsc.on("open", () => {
                return setTimeout(() => resolve(), 1);
            });
        });
    });
});
