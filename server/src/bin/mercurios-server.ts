#!/usr/bin/node

import { $store } from "../models/store/store";
import { app } from "../server/server";
import $config from "../utils/config";
import $logger from "../utils/logger";

process.on("uncaughtException", async (err) => {
    await $logger.error(err, "uncaught expection");
    process.exit(-1);
});

process.on("unhandledRejection", async (reason, promise) => {
    await $logger.error({ reason }, "unhlanded rejection");
    process.exit(-1);
});

$store.setup().then(() => {
    app.listen(4254, () => {
        $logger.info(`Server listening on port 4254`);
    });
});
