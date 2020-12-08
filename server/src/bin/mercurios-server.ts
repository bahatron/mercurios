#!/usr/bin/node
import http from "http";
import { $store } from "../models/store/store";
import expressApp from "../server/server";
import createWsServer from "../server/websocket/ws-server";
import $config from "../utils/config";
import $logger from "../utils/logger";

const PORT = parseInt($config.server_port);

const HTTP_SERVER = new http.Server(expressApp);
const WEBSOCKET_SERVER = createWsServer(HTTP_SERVER);

process.on("uncaughtException", (err) => {
    $logger.error(err, "uncaught expection");
    process.exit(-1);
});

process.on("unhandledRejection", async (reason, promise) => {
    await $logger.error({ reason }, "unhlanded rejection");
    process.exit(-1);
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

$store
    .setup()
    .then(() => {
        HTTP_SERVER.listen(PORT);
    })
    .catch((err) => $logger.error(err) && process.exit(0));
