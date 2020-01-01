#!/usr/bin/node

import http from "http";
import expressApp from "../http/server";
import $logger from "../services/logger";
import createWsServer from "../websocket/server";
import $mysql from "../services/mysql";

$logger.debug("debug mode on");

const PORT = 3000;
const HTTP_SERVER = new http.Server(expressApp);
const WEBSOCKET_SERVER = createWsServer(HTTP_SERVER);

process
    .on("unhandledRejection", (reason, promise) => {
        $logger.warning("PROCESS: unhlanded rejection");
        $logger.debug("rejection: ", { reason, promise });
    })
    .on("uncaughtException", err => {
        $logger.error(`PROCESS: uncaught exception - ${err.message}`);
        $logger.debug(`exepction: `, err);
        process.exit(-1);
    });

async function start() {
    try {
        await $mysql.migrate.latest();

        [WEBSOCKET_SERVER, HTTP_SERVER].forEach(server => {
            server.on("listening", () => {
                $logger.info(
                    `${server.constructor.name} listening on port ${PORT}`
                );
            });

            server.on("error", err => {
                $logger.error(
                    `${server.constructor.name} error - ${err.message}`,
                    err
                );
                
                $logger.debug(`error`, err);
            });
        });

        HTTP_SERVER.listen(PORT);
    } catch (err) {
        switch (err.code) {
            case "ER_TABLE_EXISTS_ERROR":
                return;
            default:
            // nothing
        }

        throw err;
    }
}

start();
