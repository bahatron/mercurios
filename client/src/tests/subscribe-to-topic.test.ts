import { connect } from "..";
import { expect } from "chai";

describe("Feature: Subscribe To Topic", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "subscribe_topic_test",
        debug: Boolean(process.env.MERCURIOS_DEV),
    });

    it("can subscribe to topics", async () => {
        return new Promise<void>(async (resolve) => {
            let topic = "subscribe_topic_test";
            let data = { beth: "sanchez" };

            let subscription = await _client.subscribe(topic, (msg) => {
                expect(msg.subscription).to.deep.eq(subscription);
                expect(msg.subject).to.deep.eq(topic);
                expect(msg.event.topic).to.deep.eq(topic);
                expect(msg.event.data).to.deep.eq(data);

                resolve();
            });

            await _client.publish(topic, { data });
        });
    });
});
