import { Logger } from "@bahatron/utils/lib/logger";

export const $logger = Logger({ pretty: true });

process.on("unhandledRejection", (err) => {
    $logger.warning(err, "unhandled rejection");
});

process.on("uncaughtException", (err) => {
    $logger.warning(err, "unhandled error");
});
