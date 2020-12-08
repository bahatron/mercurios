import ws from "ws";
import { Subscription } from "ts-nats";
import subscribe_to_topic from "../../handlers/subscribe-to-topic";
import unsubscribe_to_topic from "../../handlers/unsubscribe-to-topic";
import $nats from "../../services/nats";
import $logger from "../../utils/logger";
import $json from "../../utils/json";

export interface MercuriosClientMessage {
    action: string;
    topic?: string;
    queue?: string;
    subscription?: string;
}

interface WsRequestHandlerParams {
    connection: Connection;
    topic?: string;
    subscription?: string;
    queue?: string;
}
export interface WsRequestHandler {
    (params: WsRequestHandlerParams): void;
}

// this is my router
const ACTIONS: Record<string, WsRequestHandler> = {
    subscribe: subscribe_to_topic,
    unsubscribe: unsubscribe_to_topic,
};

export type Connection = ReturnType<typeof Connection>;
export function Connection(_id: string, _socket: ws) {
    let clientName = `mercurios:wsc:${_id}`;
    let _dispatcher = $nats.connect(clientName);
    let _logger = $logger.id(clientName);
    let _subscriptions: Map<string, Subscription> = new Map();

    let conn = {
        get id() {
            return _id;
        },
        get socket() {
            return _socket;
        },
        get dispatcher() {
            return _dispatcher;
        },
        get subscriptions() {
            return _subscriptions;
        },
        get logger() {
            return _logger;
        },
        async close() {
            if (!(await _dispatcher).isClosed()) {
                await (await _dispatcher).drain();
                await (await _dispatcher).close();

                _subscriptions.forEach((sub, topic) => {
                    sub.unsubscribe();
                    _subscriptions.delete(topic);
                });
            }

            return _socket.terminate();
        },
        async ping() {
            conn.logger.debug(`PING`);

            if (conn.socket.readyState !== conn.socket.OPEN) {
                throw new Error("already_closed");
            }

            await new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error("timeout")), 2000);

                conn.socket.once("pong", () => {
                    conn.logger.debug(`PONG`);
                    resolve();
                });

                conn.socket.ping();
            });
        },
    } as const;

    _socket.on("message", async (data) => {
        try {
            let {
                action,
                topic,
                queue,
                subscription,
            }: MercuriosClientMessage = $json.parse(data);

            _logger.debug(`ws message received`, {
                action,
                topic,
                queue,
                subscription,
            });

            await ACTIONS[action]?.({
                connection: conn,
                topic,
                subscription,
                queue,
            });
        } catch (err) {
            _logger.warning(`message error: ${err.message}`, err);
        }
    });

    _socket.on("unexpected-response", (req, res) => {
        _logger.warning(`unexpected response`, req);
    });

    _socket.on("close", async () => {
        _logger.info("socket closed");
    });

    _socket.on("error", async (err) => {
        _logger.error(err, "socket error");
        await conn.close();
    });

    return conn;
}
