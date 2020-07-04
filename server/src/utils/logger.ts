import { createLogger, Logger, Handler } from "@bahatron/logger";
import $config from "./config";
import $json from "./json";

const $logger: Logger = createLogger({
    debug: $config.debug,
    id: `mercurios`,
    colours: $config.dev_mode,
    formatter: $config.dev_mode ? undefined : $json.stringify,
});

const inspectEntry: Handler = ({ context }) => {
    if (context !== undefined) {
        $logger.inspect(context);
    }
};

if ($config.dev_mode) {
    $logger.on("debug", inspectEntry);
    $logger.on("error", inspectEntry);
}

export default $logger;
