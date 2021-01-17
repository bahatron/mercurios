import { createLogger, Logger, Handler } from "@bahatron/logger";
import { $config } from "./config";

const $logger: Logger = createLogger({
    debug: $config.debug,
    id: `mercurios`,
    colours: $config.dev_mode,
    formatter: $config.dev_mode ? undefined : JSON.stringify,
});

const inspectEntry: Handler = ({ context }) => {
    if (context !== undefined) {
        $logger.inspect(context);
    }
};

export default $logger;
