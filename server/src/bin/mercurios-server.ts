#!/usr/bin/node

import { $store } from "../models/store/store";
import { server } from "../server/server";
import { $config } from "../utils/config";
import $logger from "../utils/logger";

process.on("uncaughtException", async (err) => {
    await $logger.error(err, "uncaught expection");
    process.exit(-1);
});

process.on("unhandledRejection", async (reason, promise) => {
    await $logger.error({ reason }, "unhlanded rejection");
    process.exit(-1);
});

$logger.info("starting mercurios server", {
    dev_mode: $config.dev_mode,
    debug: $config.debug,
    store: $config.mercurios_store_driver,
    pid: process.pid,
});

$store.setup().then(() => {
    $logger.info("store service initialised", {
        pid: process.pid,
    });

    server.listen(4254, () => {
        $logger.info(`Server listening on port 4254`, { pid: process.pid });
    });
});
