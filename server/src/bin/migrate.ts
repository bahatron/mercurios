import $logger from "../utils/logger";
import $config from "../utils/config";
import { $store } from "../models/store/store";

$store
    .setup()
    .then(() =>
        $logger.info(
            `migrations completed - driver: ${$config.mercurios_driver}`
        )
    )
    .catch((err) => $logger.error(err))
    .finally(process.exit);
