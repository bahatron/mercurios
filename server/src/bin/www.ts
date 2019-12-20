import expressServer from "../http";
import http from "http";
import createWsServer from "../websocket";
import $logger from "../services/logger";
import $env from "@bahatron/env";

const PORT = parseInt($env.get("PORT", "3000"));

const httpServer = new http.Server(expressServer);

const wsServer = createWsServer(httpServer);

$logger.debug("debug mode on");

wsServer.on("listening", () => {
    $logger.info(`Webscoket server listening`);
});

httpServer.on("listening", () => {
    $logger.info(`Http server listening on port ${PORT}`);
});

httpServer.on("error", err => {
    $logger.error(`Http server error: ${err.message}`);
});

httpServer.listen(PORT);
