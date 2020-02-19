import { loggerFactory, Logger } from "@bahatron/logger";
import $config from "./config";

const $logger: Logger = loggerFactory({
    debug: $config.dev_mode,
    id: $config.logger_id || undefined,
});

export default $logger;
