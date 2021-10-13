import MercuriosClient from "..";
import { $config } from "../utils/config";
import { $logger } from "../utils/logger";

describe("subscribe to topic", () => {
    let mercurios: MercuriosClient;
    beforeAll(async () => {
        mercurios = MercuriosClient({
            url: $config.test_url,
            debug: true,
        });
    });

    it.skip("can listen to topics", async () => {
        // todo
        $logger.debug("TODO");
    });
});
