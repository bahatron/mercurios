import { createLogger, LogEntry } from "@bahatron/logger";

const $logger = createLogger({
    debug: true,
    formatter:
        process.env.NODE_ENV === "production" ? JSON.stringify : undefined,
    id: "client playground",
    colours: process.env.NODE_ENV !== "production",
});

function inspectObject(params: LogEntry) {
    if (process.env.NODE_ENV === "production" || !params.context) {
        return;
    }

    $logger.inspect(params.context);
}

$logger.on("debug", inspectObject);
$logger.on("error", inspectObject);
$logger.on("info", inspectObject);

export default $logger;
