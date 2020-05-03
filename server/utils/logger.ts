import { createLogger, Logger } from "@bahatron/logger";
import $config from "./config";
import $json from "./json";

const $logger: Logger = createLogger({
    debug: $config.debug,
    id: `[${process.pid.toString()}]`.padEnd(7),
    colours: $config.dev_mode,
    formatter: $config.dev_mode
        ? undefined
        : (params) => $json.stringify(params),
});

$logger.on("debug", (payload) => {
    if ($config.dev_mode && payload.context !== undefined) {
        // $logger.inspect(payload);
        $logger.inspect(payload.context);
    }
});

export default $logger;
