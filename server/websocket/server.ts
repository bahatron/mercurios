import $ws from "ws";
import { Server } from "http";
import $nats from "../services/nats";
import $logger from "../services/logger";
import { Client } from "ts-nats";
import $error from "../services/error";
import $json from "../services/json";

const $uuid = require("uuid");

interface ActionContext {
    id: string;
    socket: $ws;
    dispatcher: Client;
    options?: any;
}

const _actions: Record<string, (context: ActionContext) => void> = {
    subscribe: ({ id, socket, dispatcher, options }: ActionContext) => {
        let { topic } = $json.parse(options);
        if (!topic) {
            throw $error.ExpectationFailed(
                `ws connection - no topic for subscripton`
            );
        }

        dispatcher.subscribe(`event_published`, (err, msg) => {
            $logger.debug(`ws connection - got event - ws id: ${id}`);
            if (err) {
                $logger.warning(`ws conn - subscribe error: ${err.message}`);
            }

            if (msg.data.topic === topic) {
                socket.send($json.stringify(msg.data));
            }
        });
    },
};

function ping(wss: $ws.Server) {
    wss.clients.forEach(function each(ws: any) {
        $logger.debug(`pinging client id: ${ws._id}`);

        if (ws.isAlive === false) {
            return ws.terminate();
        }

        ws.isAlive = false;

        ws.ping();
    });
}

export default function createWsServer(httpServer: Server): $ws.Server {
    const _wss = new $ws.Server({ server: httpServer });

    /** @todo: use proper logging */
    _wss.on("error", err => {
        $logger.warning(`ws server error - ${err.message}`);
        $logger.error(err);
    });

    _wss.on("connection", async (socket, request) => {
        let id = $uuid.v4();

        $logger.info(`ws - new connection - id: ${id}`);

        (socket as any)._id = id;

        let dispatcher = await $nats.connect(`ws_client_${id}`);

        socket.on("message", data => {
            // let { action, options }: ClientMessage = $json.parse(data);
            let { action, options } = $json.parse(data);

            $logger.debug(`message`, { action, options });

            _actions[action]({ id, socket, dispatcher, options });
        });

        socket.on("pong", () => {
            $logger.debug(`pong recieved from client ${id}`);

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
            $logger.warning(`ws - coonection error - ${err.message}`);
            $logger.error(err);
            await dispatcher.drain();
            await dispatcher.close();

            await socket.terminate();
        });

        socket.on("open", async () => {
            await ping(_wss);
        });
    });

    /**
     * @description: ping all clients every 30 seconds
     * and terminate the ones that do not respond
     */
    setInterval(() => ping(_wss), 10000);

    return _wss;
}
