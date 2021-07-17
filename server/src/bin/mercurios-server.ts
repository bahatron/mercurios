import { $store } from "../models/store/store";
import { server } from "../server/server";
import { $config } from "../utils/config";
import $logger from "../utils/logger";

process.on("uncaughtException", async (err) => {
    await $logger.error(err, "uncaught exception");
    process.exit(-1);
});

process.on("unhandledRejection", async (reason, promise) => {
    await $logger.error({ reason }, "unhandled rejection");
    process.exit(-1);
});

$logger.info(
    {
        dev_mode: $config.dev_mode,
        debug: $config.debug,
        store: $config.store_driver,
        pid: process.pid,
    },
    "starting mercurios server"
);

$store.setup().then(() => {
    $logger.info(
        {
            pid: process.pid,
        },
        "store service initialized"
    );

    server.listen(4254, () => {
        $logger.info(
            {
                pid: process.pid,
            },
            `Server listening on port 4254`
        );
    });
});
