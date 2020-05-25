import ws from "ws";
import $logger from "../utils/logger";
import { Client, Subscription } from "ts-nats";
import $json from "../utils/json";
import $nats from "../utils/nats";
import subscribe_to_topic from "../api/subscribe_to_topic";
import unsubscribe_to_topic from "../api/unsubscribe_to_topic";

export type Connection = ReturnType<typeof Connection>;
export function Connection(_id: string, _socket: ws) {
    let _dispatcher = $nats.connect(`mc_${_id}`);
    let _logger = $logger.id(`mc_${_id}`);
    let _subscriptions: Map<string, Subscription> = new Map();

    _socket.on("message", (data) => {
        try {
            let { action, topic, queue } = $json.parse(data);

            _logger.debug(
                `message received - action: ${action} topic: ${topic} queue: ${queue}`
            );

            switch (action) {
                case "subscribe":
                    return subscribe_to_topic(conn, topic, queue);
                case "unsubscribe":
                    return unsubscribe_to_topic(conn, topic);
                default:
                    return;
            }
        } catch (err) {
            _logger.warning(`message error: ${err.message}`, err);
        }
    });

    _socket.on("unexpected-response", (req, res) => {
        _logger.warning(`unexpected response`, req);
    });

    _socket.on("close", async () => {
        _logger.debug(`closed`);
    });

    _socket.on("error", async (err) => {
        _logger.error("socket error", err);
        await conn.close();
    });

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
            }

            _socket.terminate();
        },
    };

    return conn;
}
