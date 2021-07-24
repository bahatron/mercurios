import { $store } from "../store/store";
import { server } from "../server/app";
import { $config } from "../utils/config";
import { $logger } from "../utils/logger";

process.on("uncaughtException", async (err) => {
    $logger.error(err, "uncaught exception");
    process.exit(-1);
});

process.on("unhandledRejection", async (reason, promise) => {
    $logger.error({ reason }, "unhandled rejection");
    process.exit(-1);
});

$store.setup().then(() => {
    $logger.info("store service initialized");

    server.listen(4254, () => {
        $logger.info(
            {
                pid: process.pid,
                dev_mode: $config.dev_mode,
                store: $config.store_driver,
            },
            `Server listening on port 4254`
        );
    });
});
