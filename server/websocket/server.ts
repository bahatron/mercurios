import $ws from "ws";
import { Server } from "http";
import $nats from "../services/nats";
import $json from "../services/json";
import $logger from "../services/logger";

const $uuid = require("uuid");

export default function createWsServer(httpServer: Server): $ws.Server {
    const wss = new $ws.Server({ server: httpServer });

    /** @todo: use proper logging */
    wss.on("error", err => {
        $logger.error(`WebSocket Server onError - ${err.message}`);
        $logger.debug(`err: `, err);
    });

    wss.on("connection", async (socket, request) => {
        let id = $uuid.v4();

        (socket as any).isAlive = true;

        /** @todo: figure this out */
        socket.on("unexpected-response", (req, res) => {
            $logger.warning(
                `WebSocket Server - Client: ${req.getHeader(
                    "REQUEST_ID"
                )} unexpected response`
            );
            $logger.debug(`request: `, req);
        });

        let dispatcher = await $nats.connect(`client_${id}`);

        dispatcher.subscribe("event_published", (err, { data }) => {
            try {
                socket.send($json.stringify(data));
            } catch (err) {
                $logger.error(
                    `WebSocket Server - Error on dispachter subscription: ${err.message}`
                );
            }
        });

        socket.on("pong", () => {
            (socket as any).isAlive = true;
        });

        socket.on("close", async () => {
            await dispatcher.drain();
            await dispatcher.close();

            await socket.terminate();
        });

        socket.on("error", async () => {
            await dispatcher.drain();
            await dispatcher.close();

            await socket.terminate();
        });
    });

    /**
     * @description: ping all clients every 30 seconds
     * and terminate the ones that do not respond
     */
    setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if ((ws as any).isAlive === false) {
                return ws.terminate();
            }

            (ws as any).isAlive = false;

            ws.ping();
        });
    }, 30000);

    return wss;
}
