import { createLogger, Logger, LogEntry } from "@bahatron/logger";
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

function inspectEntry(entry: LogEntry) {
    if ($config.dev_mode && entry.context !== undefined) {
        $logger.inspect(entry.context);
    }
}

$logger.on("debug", inspectEntry);
$logger.on("error", inspectEntry);

export default $logger;
