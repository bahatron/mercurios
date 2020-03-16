import $ws from "ws";
import { Server } from "http";
import $logger from "../services/logger";
import $uuid from "uuid";
import $connection, { WsConnection } from "./connection";
import $url from "url";

const _clients: Map<string, WsConnection> = new Map();

function ping(wss: $ws.Server) {
    _clients.forEach(async (conn, id) => {
        $logger.debug(`ws connection id: ${id} - pinging...`);
        try {
            if (conn.socket.readyState !== 1) {
                $logger.warning(`ws connection removed - id: ${id}`);
                await conn.close();
                return _clients.delete(id);
            }

            await new Promise((resolve, reject) => {
                setTimeout(() => reject("connection timeout"), 1000);

                conn.socket.once("pong", () => {
                    $logger.debug(`ws connection id: ${id} - pong!`);
                    resolve();
                });

                conn.socket.ping();
            });
        } catch (err) {
            $logger.warning(
                `ws connection - ping timeout: ${err.message || err}`
            );
            await conn.close();
            _clients.delete(id);
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
        let query = $url.parse(request.url ?? "", true).query;
        let id = typeof query.id === "string" ? query.id : $uuid.v4();

        /** @todo: what happens here? */
        if (_clients.has(id)) {
            socket.close(1008, "id already used");
            return;
        }

        _clients.set(id, await $connection({ id, socket, request }));

        $logger.info(`ws - new connection - id: ${id}`);
    });

    setInterval(() => ping(_wss), 10000);

    return _wss;
}
