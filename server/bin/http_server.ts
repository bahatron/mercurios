#!/usr/bin/node
import http from "http";
import expressApp from "../http/server";
import $logger from "../utils/logger";
import createWsServer from "../http/ws_server";
import $config from "../utils/config";
import pino, { LoggerOptions } from "pino";
const PORT = parseInt($config.server_port);

const HTTP_SERVER = new http.Server(expressApp);
const WEBSOCKET_SERVER = createWsServer(HTTP_SERVER);

process.on("uncaughtException", (err) => {
    $logger.error("uncaught expection", err);
    process.exit(-1);
});

process.on("unhandledRejection", async (reason, promise) => {
    await $logger.error("unhlanded rejection", { reason });
    process.exit(-1);
});

[WEBSOCKET_SERVER, HTTP_SERVER].forEach((server) => {
    server.on("listening", () => {
        $logger.info(`${server.constructor.name} listening on port ${PORT}`);
    });

    server.on("error", (err) => {
        $logger.warning(`${server.constructor.name} error - ${err.message}`);
        $logger.error(err.message, err);
    });
});

$logger.debug("Starting server in debug mode");

HTTP_SERVER.listen(PORT);
