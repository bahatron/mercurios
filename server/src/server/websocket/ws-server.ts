import ws from "ws";
import { Server } from "http";
import { Connection } from "./ws-connection";
import url from "url";
import { v4 } from "uuid";
import $logger from "../../utils/logger";
import { $config } from "../../utils/config";

const PING_INTERVAl = parseInt($config.mercurios_ping_interval);
const _clients: Set<Connection> = new Set();

export default function createWsServer(httpServer: Server): ws.Server {
    const wss = new ws.Server({ server: httpServer });

    wss.on("error", (err) => {
        $logger.error(err, `ws server error - ${err.message}`);
    });

    wss.on("listening", async () => {
        setInterval(async () => {
            let clients = Array.from(_clients);
            for (let conn of clients) {
                try {
                    await conn.ping();
                } catch (err) {
                    conn.logger.warning("PING failed", err);
                    removeConnection(conn);
                }
            }
        }, PING_INTERVAl);

        $logger.info("websocket server initiated");
    });

    wss.on("connection", (socket, request) => {
        try {
            /**@todo: update deprecated library */
            let query = url.parse(request.url ?? "", true).query;
            $logger.debug({ query }, "received ws connection request");

            let id = typeof query.id === "string" ? query.id : v4();

            let conn = Connection(id, socket);
            _clients.add(conn);

            conn.logger.info("connection open");

            socket.on("close", () => removeConnection(conn));
        } catch (err) {
            $logger.error(err);
        }
    });

    return wss;
}

async function removeConnection(conn: Connection) {
    await conn.close();
    _clients.delete(conn);
    $logger.debug({ id: conn.id }, "connection killed");
}
