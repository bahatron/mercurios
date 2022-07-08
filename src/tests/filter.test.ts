import MercuriosClient from "..";
import { $config } from "../utils/config";

describe(`Filter Topic`, () => {
    let mercurios = MercuriosClient({
        url: $config.TEST_URL,
        debug: true,
    });

    let topic = "filter_topic_test";
    let key = "filter_test_key";

    beforeAll(async () => {
        await mercurios.deleteTopic(topic);

        await Promise.all(
            Array(20)
                .fill(null)
                .map((item, index) => {
                    return mercurios.append(topic, {
                        data: index + 1,
                        key: index >= 10 ? key : undefined,
                    });
                })
        );
    });

    it(`returns the entire stream with no filter`, async () => {
        let result = await mercurios.filter(topic);

        expect(Array.isArray(result)).toBeTruthy();
        expect(result).toHaveLength(20);
    });

    it(`can filter by key`, async () => {
        let result = await mercurios.filter(topic, {
            key,
        });

        expect(result).toHaveLength(10);
    });

    it(`filter by sequence range`, async () => {
        let result = await mercurios.filter(topic, {
            from: 5,
            to: 10,
        });

        expect(result).toHaveLength(5);

        expect(result.map((event) => event.seq).sort()).toEqual([
            5, 6, 7, 8, 9,
        ]);
    });
});
