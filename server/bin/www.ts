#!/usr/bin/node

import http from "http";
import expressApp from "../http/server";
import $logger from "../services/logger";
import createWsServer from "../websocket/server";
import $mysql from "../services/mysql";
import $env from "@bahatron/env";

const PORT = 3000;
const HTTP_SERVER = new http.Server(expressApp);
const WEBSOCKET_SERVER = createWsServer(HTTP_SERVER);

process
    .on("unhandledRejection", (reason, promise) => {
        $logger.warning("PROCESS: unhlanded rejection", { reason, promise });
    })
    .on("uncaughtException", err => {
        $logger.error(`PROCESS: uncaught exception - ${err.message}`, err);
        process.exit(-1);
    });

[WEBSOCKET_SERVER, HTTP_SERVER].forEach(server => {
    server.on("listening", () => {
        $logger.info(`${server.constructor.name} listening on port ${PORT}`);
    });

    server.on("error", err => {
        $logger.error(`${server.constructor.name} error - ${err.message}`, err);
    });
});

async function start() {
    $logger.debug("debug mode on");

    await $mysql.migrate.latest().catch(err => {
        switch (err.code) {
            case "ER_TABLE_EXISTS_ERROR":
                return;
            default:
                $logger.warning(err.message, err);
                process.exit(-1);
        }
    });

    HTTP_SERVER.listen(PORT, () => {
        if ($env.get("ENV", "") === "dev") {
            try {
                /** @todo */
                // execSync("npm run test");
            } catch (err) {
                $logger.warning(`Test suit run failed - ${err.message}`);
            }
        }
    });
}

start();
