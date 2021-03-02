import { connect } from "..";
import { EventEmitter } from "events";
import { expect } from "chai";

describe("Feature: Unsubscribe to Topic", () => {
    let _client = connect({
        url: process.env.MERCURIOS_URL || "",
        id: "unsubscribe_topic_test",
    });

    it("can unsubscribe", async () => {
        let topic = "unsubscribe_topic_test";

        return new Promise<void>(async (resolve, reject) => {
            let sub = await _client.subscribe(topic, async () => {
                console.log(`sub fired`);
                reject("this should not happen");
            });

            await _client.unsubscribe(sub);

            await _client.publish(topic);

            setTimeout(resolve, 500);
        });
    });
});
