import expressServer from "../http";
import http from "http";
import createWsServer from "../websocket";

const PORT = 3000;

const httpServer = new http.Server(expressServer);

const wsServer = createWsServer(httpServer);

wsServer.on("listening", () => {
    console.log(`WebSocket Server - listening`);
});

httpServer.on("listening", () => {
    console.log(`HTTP Server - listening in port ${PORT}`);
});

httpServer.on("error", err => {
    console.log(`HTTP Server - ERROR:`, err.message);
});

httpServer.listen(PORT);
