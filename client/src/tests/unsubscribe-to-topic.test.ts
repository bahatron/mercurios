import { connect } from "..";

const TOPIC = "unsubscribe_topic_test";

describe("Feature: Unsubscribe to Topic", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: TOPIC,
        debug: Boolean(process.env.MERCURIOS_DEV),
    });

    it("can unsubscribe", async () => {
        return new Promise<void>(async (resolve, reject) => {
            let sub = await _client.subscribe(TOPIC, async () => {
                reject(new Error("this should not happen"));
            });

            await _client.unsubscribe(sub);

            await _client.subscribe(TOPIC, async () => {
                await new Promise((_resolve) => setTimeout(_resolve, 250));
                resolve();
            });

            await _client.publish(TOPIC);
        });
    });
});
