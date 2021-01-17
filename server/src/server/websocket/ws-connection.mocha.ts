import $ws from "ws";
import { $config } from "../../utils/config";

describe("Feature: websocket connection", () => {
    let _wsc: $ws;

    it("can stablish a ws connection", async () => {
        return new Promise(async (resolve) => {
            _wsc = new $ws(`${$config.test_url}?id=connection_test`);

            _wsc.on("open", () => {
                return setTimeout(() => resolve(), 1);
            });
        });
    });
});
