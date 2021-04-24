import { $store } from "../models/store/store";
import $nats from "../services/nats";
import { $config } from "../utils/config";
import $error from "../utils/error";
import $logger from "../utils/logger";

export async function ping() {
    let checks = [$store.isHealthy(), $nats.isHealthy()];

    let [storeResult, natsResult] = await Promise.all(checks);

    let result = {
        store: { driver: $config.store_driver, result: storeResult },
        nats: { result: natsResult },
    } as const;

    $logger.debug(result, `ping result`);

    if (!storeResult || !natsResult) {
        throw $error.InternalError("health check failed", result);
    }

    return result;
}
