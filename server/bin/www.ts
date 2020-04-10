#!/usr/bin/node
import http from "http";
import expressApp from "../http/server";
import $logger from "../services/logger";
import createWsServer from "../http/ws_server";
import $config from "../services/config";

const PORT = parseInt($config.server_port);

const HTTP_SERVER = new http.Server(expressApp);
const WEBSOCKET_SERVER = createWsServer(HTTP_SERVER);

process.on("uncaughtException", (err) => {
    $logger.warning("uncaught expection");
    $logger.error(err);
    process.exit(-1);
});

process.on("unhandledRejection", (reason) => {
    $logger.warning("unhandled rejection", reason);
});

[WEBSOCKET_SERVER, HTTP_SERVER].forEach((server) => {
    server.on("listening", () => {
        $logger.info(`${server.constructor.name} listening on port ${PORT}`);
    });

    server.on("error", (err) => {
        $logger.warning(`${server.constructor.name} error - ${err.message}`);
        $logger.error(err);
    });
});

$logger.debug("Starting server in debug mode");

HTTP_SERVER.listen(PORT);
