import $ws from "ws";
import { Server } from "http";
import $nats from "../services/nats";
import $json from "../services/json";
import $logger from "../services/logger";
import $connection from "./connection";

const $uuid = require("uuid");

export default function createWsServer(httpServer: Server): $ws.Server {
    const _wss = new $ws.Server({ server: httpServer });
    const _clients: Map<string, any> = new Map();

    function ping() {
        _wss.clients.forEach(function each(ws) {
            if ((ws as any).isAlive === false) {
                return ws.terminate();
            }

            (ws as any).isAlive = false;

            ws.ping();
        });
    }

    /** @todo: use proper logging */
    _wss.on("error", err => {
        $logger.error(`ws server error - ${err.message}`, err);
    });

    _wss.on("connection", async (socket, request) => {
        let id = $uuid.v4();

        let dispatcher = await $nats.connect(`ws_client_${id}`);

        _clients.set(id, $connection({ id, dispatcher, socket, request }));

        socket.on("pong", () => {
            (socket as any).isAlive = true;
        });

        socket.on("unexpected-response", (req, res) => {
            $logger.warning(
                `ws - unexpected respose - request_id: ${req.getHeader(
                    "REQUEST_ID"
                )}`,
                req
            );
        });

        socket.on("close", async () => {
            $logger.warning(`ws - connection closed - id: ${id}`);
            await dispatcher.drain();
            await dispatcher.close();

            await socket.terminate();
        });

        socket.on("error", async err => {
            $logger.error(`ws - coonection error - ${err.message}`, err);
            await dispatcher.drain();
            await dispatcher.close();

            await socket.terminate();
        });

        socket.on("open", async () => {
            await ping();
            $logger.info(`ws - `);
        });
    });

    /**
     * @description: ping all clients every 30 seconds
     * and terminate the ones that do not respond
     */
    setInterval(ping, 10000);

    return _wss;
}
