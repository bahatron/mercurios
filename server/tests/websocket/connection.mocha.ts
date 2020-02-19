import $ws from "ws";
import $config from "../../services/config";

describe("Feature: websocket connection", () => {
    let _wsc: $ws;

    it("can stablish a ws connection", async () => {
        return new Promise(async resolve => {
            _wsc = new $ws($config.test_url);

            _wsc.on("open", () => {
                // resolve();
                return setTimeout(() => resolve(), 1);
            });
        });
    });
});
