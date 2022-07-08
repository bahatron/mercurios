import MercuriosClient from "..";
import { MercuriosEventSchema } from "../client/event";
import { FEATURE_NOTIFY_ENABLED } from "../static";
import { $config } from "../utils/config";
import { $validator } from "../utils/validator";

describe("subscribe to topic", () => {
    if (FEATURE_NOTIFY_ENABLED) {
        let mercurios: MercuriosClient;
        const TOPIC = "subscribe_topic_test";

        beforeAll(async () => {
            mercurios = MercuriosClient({
                url: $config.TEST_URL,
                debug: true,
            });
        });

        it("can listen to topics", async () => {
            let subscriptionResult = new Promise((resolve) => {
                (mercurios as any).on("event", (event) => {
                    resolve(event);
                });
            });

            let publishResult = await mercurios.append(TOPIC, {
                data: {
                    rick: "sanchez",
                },
            });

            expect(
                $validator.json(await subscriptionResult, MercuriosEventSchema)
            ).toHaveLength(0);

            expect(await subscriptionResult).toEqual(publishResult);
        });
    } else {
        it("skips", () => {});
    }
});
