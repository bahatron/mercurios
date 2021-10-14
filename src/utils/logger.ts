import { Logger } from "@bahatron/utils/lib/logger";

export { Logger };
export function createLogger({ debug = false } = {}) {
    return Logger({
        id: `mercurios:${process.pid}`,
        pretty: process.env.NODE_ENV !== "production",
        debug,
    });
}

export const $logger = createLogger({ debug: true });

process.on("unhandledRejection", (err) => {
    $logger.warning(err, "unhandled rejection");
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    $logger.warning(err, "unhandled error");
    process.exit(1);
});
