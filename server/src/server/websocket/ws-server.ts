import ws from "ws";
import { Server } from "http";
import { Connection } from "./ws-connection";
import url from "url";
import { v4 } from "uuid";
import $logger from "../../utils/logger";
import $config from "../../utils/config";

const PING_INTERVAl = parseInt($config.mercurios_ping_interval);
const _clients: Record<string, Connection> = {};

export default function createWsServer(httpServer: Server): ws.Server {
    const wss = new ws.Server({ server: httpServer });

    wss.on("error", (err) => {
        $logger.error(err, `ws server error - ${err.message}`);
    });

    wss.on("listening", async () => {
        setInterval(async () => {
            let clients = Object.values(_clients);
            for (let conn of clients) {
                try {
                    await conn.ping();
                } catch (err) {
                    conn.logger.warning("PING failed", err);
                    removeConnection(conn);
                }
            }
        }, PING_INTERVAl);
    });

    wss.on("connection", (socket, request) => {
        try {
            let query = url.parse(request.url ?? "", true).query;
            $logger.debug("received ws connection request", { query });

            let id = typeof query.id === "string" ? query.id : v4();

            if (_clients[id]) {
                socket.terminate();
                return;
            }

            let conn = Connection(id, socket);
            _clients[id] = conn;

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
    await conn.socket.terminate();
    delete _clients[conn.id];
    $logger.debug("connection killed");
}
