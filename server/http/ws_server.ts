import ws from "ws";
import { Server } from "http";
import $logger from "../utils/logger";
import { WsConnection } from "./ws_connection";

const _clients: Set<WsConnection> = new Set();

function ping() {
    _clients.forEach(async (conn) => {
        try {
            if (conn.socket.readyState !== 1) {
                $logger.debug(`ws client: ${conn.id} - dropped`);
                await conn.close();
                return _clients.delete(conn);
            }

            $logger.debug(`ws client: ${conn.id} - PING`);

            await new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error("connection timeout")), 1000);

                conn.socket.once("pong", () => {
                    $logger.debug(`ws client: ${conn.id} - PONG`);
                    resolve();
                });

                conn.socket.ping();
            });
        } catch (err) {
            $logger.debug(
                `ws client: ${conn.id} - PING ERROR - ${err.message}`
            );
            await conn.close();
            _clients.delete(conn);
        }
    });
}

export default function createWsServer(httpServer: Server): ws.Server {
    const _wss = new ws.Server({ server: httpServer });

    _wss.on("error", (err) => {
        $logger.warning(`ws server error - ${err.message}`);
        $logger.error(err.message, err)
    });

    _wss.on("connection", async (socket, request) => {
        let conn = new WsConnection(request, socket);

        _clients.add(conn);

        $logger.info(`ws - new connection - id: ${conn.id}`);
    });

    setInterval(() => ping(), 10000);

    return _wss;
}
