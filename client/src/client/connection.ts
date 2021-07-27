import $ws, { ClientOptions } from "ws";
import { $error } from "../utils/error";
import { Logger } from "@bahatron/utils";
import {
    MercuriosMessage,
    MercuriosEvent,
    MercuriosEventHandler,
    ServerMessage,
} from "./interfaces";

interface QueuedHandler {
    (): void;
}

export function Connection(_url: string, _id: string, _logger: Logger) {
    let _queue: Array<QueuedHandler> = [];
    let _completed: Set<QueuedHandler> = new Set();
    let _pingInterval: NodeJS.Timeout | undefined;
    let _reconnectInterval: NodeJS.Timeout | undefined;
    let _listeners: Record<string, Set<MercuriosEventHandler>> = {};
    let _socket = Socket();

    function Socket() {
        try {
            let socket = new $ws(_url, <ClientOptions>{});

            socket.on("open", async function onSocketOpen() {
                _logger.info("ws connection open");

                _pingInterval = setInterval(async () => {
                    if (socket.readyState !== socket.OPEN) {
                        throw new Error("connection_closed");
                    }

                    await new Promise<void>((resolve, reject) => {
                        setTimeout(() => reject(new Error("timeout")), 1000);

                        socket.once("pong", () => {
                            resolve();
                        });

                        socket.ping();
                    });
                }, 10000);

                // this also recreates subscriptions on reconnect
                _queue = _queue.concat(Array.from(_completed));

                let action: QueuedHandler | undefined;
                while ((action = _queue.pop())) {
                    await action();
                    _completed.add(action);
                }
            });

            socket.on("message", function onSocketMessage(message: any) {
                let { subscription, subject, event } = JSON.parse(
                    (message.data ?? message).toString()
                );

                connection.emit(subscription, { subscription, subject, event });

                _logger.debug(
                    {
                        subscription,
                        topic: event.topic,
                    },
                    "message received"
                );
            });

            socket.on("error", async function onSocketError(err) {
                _logger.error(err, "connection error");

                setTimeout(reconnect, 1000);
            });

            socket.onclose = function onSocketClose({ wasClean, code }: any) {
                if (code == 1000 && wasClean) {
                    return;
                }

                _logger.warning(
                    {
                        wasClean,
                        code,
                    },
                    `connection closed`
                );

                clearInterval(_pingInterval!);
                reconnect();
            };

            return socket;
        } catch (err) {
            _logger.error(err);
            reconnect();
        }
    }

    async function reconnect() {
        if (_reconnectInterval !== undefined) {
            return;
        }

        _reconnectInterval = setInterval(async () => {
            if (_socket && _socket.readyState === _socket.OPEN) {
                clearInterval(_reconnectInterval!);
                _reconnectInterval = undefined;
                return;
            }

            _socket = Socket();

            if (!_socket) {
                _logger.warning("unsuccessful ws connection, retrying...");
            }
        }, 1000);
    }

    let connection = {
        emit(event: string, message?: MercuriosMessage): void {
            if (!_listeners[event]) {
                return;
            }

            _listeners[event].forEach((listener) =>
                listener(message as MercuriosMessage)
            );
        },

        on(event: string, handler: MercuriosEventHandler): void {
            if (!_listeners[event]) {
                _listeners[event] = new Set();
            } else if (_listeners[event].has(handler)) {
                return;
            }

            _listeners[event].add(handler);
        },

        close() {
            _socket?.close(1000);
            _completed.clear();
        },

        isOpen() {
            return (
                _socket?.readyState === _socket?.OPEN &&
                _socket?.readyState !== undefined
            );
        },

        send(message: ServerMessage): Promise<void> {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(
                        $error.ConnectionError(
                            "timeout reached while sending message"
                        )
                    );
                }, 5000);

                try {
                    const action = () => {
                        _socket?.send(JSON.stringify(message));

                        resolve();
                    };

                    if (connection.isOpen()) {
                        action();
                    } else {
                        _queue.push(action);
                    }
                } catch (err) {
                    reject(err);
                }
            });
        },
    } as const;

    return connection;
}
