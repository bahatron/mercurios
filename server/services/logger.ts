import { loggerFactory, Logger } from "@bahatron/logger";
import $config from "./config";

const $logger: Logger = loggerFactory({ debug: $config.dev_mode });

export default $logger;
