import ws from "ws";
import { Server } from "http";
import $logger from "../utils/logger";
import { Connection } from "./ws_connection";
import url from "url";
import uuid from "uuid";

const _clients: Map<string, Connection> = new Map();

export default function createWsServer(httpServer: Server): ws.Server {
    const wss = new ws.Server({ server: httpServer });

    wss.on("error", (err) => {
        $logger.warning(`ws server error - ${err.message}`);
        $logger.error(err.message, err);
    });

    wss.on("connection", async (socket, request) => {
        let query = url.parse(request.url ?? "", true).query;

        let id = typeof query.id === "string" ? query.id : uuid.v4();

        if (_clients.has(id)) {
            socket.close();
            return;
        }

        let conn = Connection(id, socket);
        _clients.set(id, conn);

        $logger.info(`ws - new connection - id: ${conn.id}`);
    });

    setInterval(() => ping(), 10000);

    return wss;
}

function ping() {
    _clients.forEach(async (conn) => {
        try {
            if (conn.socket.readyState !== 1) {
                $logger.debug(`ws client: ${conn.id} - dropped`);
                await conn.close();
                _clients.delete(conn.id);
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
            _clients.delete(conn.id);
        }
    });
}
