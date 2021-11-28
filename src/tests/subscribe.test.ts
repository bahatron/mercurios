import MercuriosClient from "..";
import { $config } from "../utils/config";

describe("subscribe to topic", () => {
    let mercurios: MercuriosClient;
    const TOPIC = "subscribe_topic_test";

    beforeAll(async () => {
        mercurios = MercuriosClient({
            url: $config.test_url,
            debug: true,
        });
    });

    it("can listen to topics", async () => {
        let subscriptionResult = new Promise((resolve) => {
            mercurios.on("event", (event) => {
                resolve(event);
            });
        });

        let publishResult = await mercurios.append(TOPIC, {
            data: {
                rick: "sanchez",
            },
        });

        expect(await subscriptionResult).toEqual(publishResult);
    });
});
