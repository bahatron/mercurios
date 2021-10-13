import MercuriosClient from "..";
import { $logger } from "../../playground/src/logger";
import { $config } from "../utils/config";

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
