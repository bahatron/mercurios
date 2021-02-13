import { $store } from "../models/store/store";
import $nats from "../services/nats";
import { $config } from "../utils/config";
import $error from "../utils/error";
import $http from "../utils/http";
import $logger from "../utils/logger";

export async function healthcheck() {
    let checks = [$store.isHealthy(), $nats.isHealthy(), pingApi()];

    return await Promise.all(checks).then(
        ([storeResult, natsResult, pingApi]) => {
            let result = {
                store: { driver: $config.store_driver, resut: storeResult },
                nats: { result: natsResult },
                http_api: { url: $config.test_url, result: pingApi },
            } as const;

            if (!storeResult || !natsResult || !pingApi) {
                throw $error.InternalError("health check failed", result);
            }

            return result;
        }
    );
}

async function pingApi() {
    try {
        await $http.get(`${$config.test_url}/ping`);

        return true;
    } catch (err) {
        $logger.error(err);
        return false;
    }
}
