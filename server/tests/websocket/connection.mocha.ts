import $ws from "ws";
import $env from "@bahatron/env";

const TEST_SERVER_URL = $env.get(`TEST_SERVER_URL`, `http://localhost:3000`);

describe("websocket connection", () => {
    it("can stablish a ws connection", async () => {
        return new Promise(async resolve => {
            const client = new $ws(TEST_SERVER_URL);

            client.on("open", () => {
                resolve();
            });
        });
    });
});
