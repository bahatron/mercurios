import ws from "ws";
import { Server } from "http";
import { Connection } from "./ws_connection";
import url from "url";
import uuid from "uuid";
import $logger from "../utils/logger";
import { $env } from "../utils/config";

const _clients: Map<string, Connection> = new Map();
export default function createWsServer(httpServer: Server): ws.Server {
    const wss = new ws.Server({ server: httpServer });

    wss.on("error", (err) => {
        $logger.error(`ws server error - ${err.message}`, err);
    });

    wss.on("connection", (socket, request) => {
        let query = url.parse(request.url ?? "", true).query;

        let id = typeof query.id === "string" ? query.id : uuid.v4();
        let pingInterval =
            parseInt(
                typeof query.pingInterval === "string" ? query.pingInterval : ""
            ) || parseInt($env.get("MERCURIOS_PING_INTERVAL", "30000"));

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
            throw new Error(`socket not open, ping failed`);
        }

        await new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error("connection timeout")), 1000);

            conn.socket.once("pong", () => {
                conn.logger.debug(`PONG`);
                resolve();
            });

            conn.socket.ping();
        });
    } catch (err) {
        conn.logger.warning(`PING ERROR - ${err.message}`);
        await conn.close();
        _clients.delete(conn.id);
    }
}
