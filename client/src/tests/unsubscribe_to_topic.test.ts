import client from "../client";

describe.only("Feature: Unsubscribe to Topic", () => {
    let _client = client.connect({
        url: process.env.MERCURIOS_URL || "",
        id: "unsubscribe_topic_test",
    });

    it("can unsubscribe", async () => {
        let topic = "unsubscribe_topic_test";

        let subscription = await new Promise<string>(async (resolve) => {
            let sub: string = await _client.subscribe(topic, () =>
                resolve(sub)
            );

            await _client.emit(topic);
        });

        return new Promise(async (resolve, reject) => {
            await _client.unsubscribe(subscription);

            _client.on(subscription, () => {
                reject(new Error("did not expected to receive a message"));
            });

            // resolve after waiting some time
            setTimeout(() => {
                expect(true).toBeTruthy();
                resolve();
            }, 500);

            await _client.emit(topic);
        });
    });
});
