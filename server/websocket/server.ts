import $ws from "ws";
import { Server } from "http";
import $logger from "../services/logger";
import { WsConnection } from "./connection";

const _clients: Set<WsConnection> = new Set();

function ping() {
    _clients.forEach(async conn => {
        $logger.debug(`ws connection id: ${conn.id} - pinging...`);
        try {
            if (conn.socket.readyState !== 1) {
                $logger.debug(`ws connection removed - id: ${conn.id}`);
                await conn.close();
                return _clients.delete(conn);
            }

            await new Promise((resolve, reject) => {
                setTimeout(() => reject("connection timeout"), 1000);

                conn.socket.once("pong", () => {
                    $logger.debug(`ws connection id: ${conn.id} - pong!`);
                    resolve();
                });

                conn.socket.ping();
            });
        } catch (err) {
            $logger.warning(
                `ws connection - ping timeout: ${err.message || err}`
            );
            await conn.close();
            _clients.delete(conn);
        }
    });
}

export default function createWsServer(httpServer: Server): $ws.Server {
    const _wss = new $ws.Server({ server: httpServer });

    _wss.on("error", err => {
        $logger.warning(`ws server error - ${err.message}`);
        $logger.error(err);
    });

    _wss.on("connection", async (socket, request) => {
        let conn = new WsConnection(request, socket);

        _clients.add(conn);

        $logger.info(`ws - new connection - id: ${conn.id}`);
    });

    setInterval(() => ping(), 10000);

    return _wss;
}
