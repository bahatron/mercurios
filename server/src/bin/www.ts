import expressServer from "../http";
import http from "http";
import createWsServer from "../websocket";
import $logger from "../services/logger";

const PORT = 3000;

const httpServer = new http.Server(expressServer);

const wsServer = createWsServer(httpServer);

$logger.debug("www", {
    debug_mode: true,
});

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
