import $createStream from "../../domain/create_stream";
import { expect } from "chai";
import $config from "../../services/config";
import $ws from "ws";
import $json from "../../services/json";
import $publishEvent from "../../domain/publish_event";

describe("Feature: subscribe to all topics", () => {
    let _wsc: $ws;
    const _topics = ["all_test_1", "all_test_2", "all_test_3", "all_test_4"];

    before(() => {
        return new Promise(async resolve => {
            await Promise.all(_topics.map(topic => $createStream(topic)));
            _wsc = new $ws($config.test_url);

            _wsc.on("open", resolve);
        });
    });

    it("recieves messages related to all topics", async () => {
        return new Promise(async resolve => {
            _wsc.send(
                $json.stringify({
                    action: "subscribe_all",
                })
            );

            await new Promise(resolve => setTimeout(resolve, 10));

            let results = await Promise.all(
                _topics.map(topic => {
                    return new Promise(async resolve => {
                        let result: any = {};

                        _wsc.on("message", async data => {
                            if ($json.parse(data).topic === topic) {
                                result.message = $json.parse(data.toString());

                                resolve(result);
                            }
                        });

                        result.event = await $publishEvent({
                            topic,
                        });
                    });
                })
            );

            results.forEach(({ message, event }: any) => {
                expect(message).to.deep.eq(event);
            });

            return resolve();
        });
    });
});
