#!/usr/bin/node
import http from "http";
import expressApp from "../http/server";
import $logger from "../services/logger";
import createWsServer from "../websocket/server";
import $mysql from "../services/mysql";

const PORT = 3000;

const HTTP_SERVER = new http.Server(expressApp);
const WEBSOCKET_SERVER = createWsServer(HTTP_SERVER);

process.on("uncaughtException", err => {
    $logger.error(err);
    process.exit(-1);
});

[WEBSOCKET_SERVER, HTTP_SERVER].forEach(server => {
    server.on("listening", () => {
        $logger.info(`${server.constructor.name} listening on port ${PORT}`);
    });

    server.on("error", err => {
        $logger.warning(`${server.constructor.name} error - ${err.message}`);
        $logger.error(err);
    });
});

async function start() {
    $logger.debug("Starting server in dev mode");

    await $mysql.migrate.latest().catch(err => {
        switch (err.code) {
            case "ER_TABLE_EXISTS_ERROR":
                $logger.warning(`migration error - table already exists`);
                return;
            default:
                throw err;
        }
    });

    HTTP_SERVER.listen(PORT);
}

start();
