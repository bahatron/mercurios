import { connect } from "..";

describe("Feature: Unsubscribe to Topic", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "unsubscribe_topic_test",
        debug: Boolean(process.env.MERCURIOS_DEV),
    });

    it("can unsubscribe", async () => {
        let topic = "unsubscribe_topic_test";

        return new Promise<void>(async (resolve, reject) => {
            let sub = await _client.subscribe(topic, async () => {
                reject("this should not happen");
            });

            await _client.unsubscribe(sub);
            // no ACK from ws
            await new Promise((_resolve) => setTimeout(_resolve, 250));

            await _client.subscribe(topic, async () => {
                await new Promise((_resolve) => setTimeout(_resolve, 250));
                resolve();
            });

            await _client.publish(topic);
        });
    });
});
