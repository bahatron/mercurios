import ws from "ws";
import { Server } from "http";
import { Connection } from "./ws_connection";
import url from "url";
import uuid from "uuid";
import $logger from "../../utils/logger";
import $config from "../../utils/config";

const CONNECTION_TIMEOUT = "connection timeout";

const _clients: Map<string, Connection> = new Map();
export default function createWsServer(httpServer: Server): ws.Server {
    const wss = new ws.Server({ server: httpServer });

    wss.on("error", (err) => {
        $logger.error(err, `ws server error - ${err.message}`);
    });

    wss.on("connection", (socket, request) => {
        let query = url.parse(request.url ?? "", true).query;

        let id = typeof query.id === "string" ? query.id : uuid.v4();
        let pingInterval =
            parseInt(query.pingInterval?.toString()) ||
            parseInt($config.mercurios_ping_interval);

        if (_clients.has(id)) {
            socket.close();
            return;
        }

        let conn = Connection(id, socket);
        _clients.set(id, conn);

        conn.logger.info("connection open");

        let interval = setInterval(() => ping(conn), pingInterval);

        socket.once("close", async () => {
            await conn.close();
            _clients.delete(conn.id);
            clearInterval(interval);
            conn.logger.info("connection closed");
        });
    });

    return wss;
}

async function ping(conn: Connection) {
    try {
        conn.logger.debug(`PING`);

        if (conn.socket.readyState !== 1) {
            await kill(conn);
            return;
        }

        await new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error(CONNECTION_TIMEOUT)), 2000);

            conn.socket.once("pong", () => {
                conn.logger.debug(`PONG`);
                resolve();
            });

            conn.socket.ping();
        });
    } catch (err) {
        if (err.message === CONNECTION_TIMEOUT) {
            conn.logger.warning(`PING FAILED - connection timeout`);
        } else {
            conn.logger.error(err);
        }

        await kill(conn);
    }
}

async function kill(conn: Connection) {
    await conn.close();
    _clients.delete(conn.id);
}
