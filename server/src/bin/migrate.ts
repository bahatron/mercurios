import $logger from "../utils/logger";
import $config from "../utils/config";
import { driver as $driver } from "../services/streams";

$driver.migrate
    .latest()
    .then(() =>
        $logger.info(
            `migrations completed - driver: ${$config.mercurios_driver}`
        )
    )
    .catch((err) => $logger.error(err))
    .finally(process.exit);
