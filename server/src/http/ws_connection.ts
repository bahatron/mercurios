import ws from "ws";
import { Subscription } from "ts-nats";
import subscribe_to_topic from "../handlers/subscribe_to_topic";
import unsubscribe_to_topic from "../handlers/unsubscribe_to_topic";
import $nats from "../utils/nats";
import $logger from "../utils/logger";
import $json from "../utils/json";
import { Logger } from "@bahatron/logger";

export interface MercuriosClientMessage {
    action: string;
    topic?: string;
    queue?: string;
    subscription?: string;
}

export interface WsRequestHandler {
    (params: {
        connection: Connection;
        topic?: string;
        subscription?: string;
        queue?: string;
    }): void;
}

// this is my router
const ACTIONS: Record<string, WsRequestHandler> = {
    subscribe: subscribe_to_topic,
    unsubscribe: unsubscribe_to_topic,
};

export type Connection = ReturnType<typeof Connection>;
export function Connection(_id: string, _socket: ws) {
    let _dispatcher = $nats.connect(`wsc_${_id}`);
    let _logger: Logger = $logger.id(`wsc_${_id}`);
    let _subscriptions: Map<string, Subscription> = new Map();

    const conn = {
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
    };

    _socket.on("message", async (data) => {
        try {
            let {
                action,
                topic,
                queue,
                subscription,
            }: MercuriosClientMessage = $json.parse(data);

            _logger.debug(`ws message received: ${action}`, {
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
        _logger.error("socket error", err);
        await conn.close();
    });

    return conn;
}
