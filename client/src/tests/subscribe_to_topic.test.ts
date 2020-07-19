import client from "../client";

describe("Feature: Subscribe To Topic", () => {
    let _client = client.connect({
        url: process.env.MERCURIOS_URL || "",
        id: "subscribe_topic_test",
    });

    it("can subscribe to topics", async () => {
        return new Promise(async (resolve) => {
            let topic = "subscribe_topic_test";
            let data = { beth: "sanchez" };

            let subscription = await _client.subscribe(topic, (msg) => {
                expect(msg.subscription).toEqual(subscription);
                expect(msg.subject).toEqual(topic);
                expect(msg.event.topic).toEqual(topic);
                expect(msg.event.data).toEqual(data);

                resolve();
            });

            await _client.emit(topic, { data });
        });
    });
});
