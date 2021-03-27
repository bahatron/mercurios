import ws, { ClientOptions } from "ws";
import { $error } from "../utils/error";
import { Logger } from "@bahatron/utils";

export interface MercuriosMessage {
    subscription: string;
    subject: string;
    event: MercuriosEvent;
}

export interface MercuriosEvent {
    topic: string;
    seq?: number;
    key?: string;
    published_at: string;
    data: any;
}

export interface MercuriosEventHandler {
    (message: MercuriosMessage): void;
}

export interface ServerMessage {
    action: "subscribe" | "unsubscribe";
    topic?: string;
    subscription?: string;
    queue?: string;
}

interface QueuedHandler {
    (): void;
}

export function Connection(_url: string, _id: string, _logger: Logger) {
    let _queue: Array<QueuedHandler> = [];
    let _completed: Set<QueuedHandler> = new Set();
    let _socket = connect();
    let _interval: any;
    let _listeners: Record<string, Set<MercuriosEventHandler>> = {};

    function Socket(): ws | WebSocket {
        try {
            if (typeof window === "undefined") {
                return new ws(_url, <ClientOptions>{});
            }

            let url = new URL(_url);
            let parsedUrl = `ws://${url.host}/${url.pathname}`;

            _logger.debug(
                { url, parsedUrl },
                "creating websocket connection.."
            );

            return new WebSocket(parsedUrl, ["ws", "wss"]);
        } catch (err) {
            throw $error.ConnectionError(
                "error connecting to mercurios WS server",
                {
                    url: _url,
                    id: _id,
                    error: err,
                }
            );
        }
    }

    function connect() {
        try {
            _logger.debug(`connecting...`);
            let socket = Socket();

            socket.onopen = async function onSocketOpen() {
                _logger.debug("socket open");

                // recreate subscriptions on reconnect
                _queue = _queue.concat(Array.from(_completed));

                let action: QueuedHandler | undefined;
                while ((action = _queue.pop())) {
                    await action();
                    _completed.add(action);
                }
            };

            socket.onmessage = function onSocketMessage(message: any) {
                let { subscription, subject, event } = JSON.parse(
                    (message.data ?? message).toString()
                );

                connection.emit(subscription, { subscription, subject, event });

                _logger.debug(
                    { subscription, subject, topic: event.topic },
                    "message received"
                );
            };

            socket.onerror = async function onSocketError({
                message,
                error,
            }: any) {
                _logger.error(
                    {
                        event: "error",
                        message,
                        error,
                    },
                    "socket error"
                );

                reconnect();
            };

            socket.onclose = function onSocketClose({ wasClean, code }: any) {
                _logger.debug({ wasClean, code }, `socket connection closed`);

                if (code == 1000) {
                    return;
                }

                reconnect();
            };

            return socket;
        } catch (err) {
            _logger.error(err);
            reconnect();
        }
    }

    async function reconnect() {
        _logger.debug(`reconnecting...`);
        if (_interval !== undefined) {
            return;
        }

        _interval = setInterval(async () => {
            if (_socket && _socket.readyState === _socket.OPEN) {
                clearInterval(_interval);
                _interval = undefined;
                return;
            }

            _socket = connect();

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

        once(event: string, handler: MercuriosEventHandler): void {
            new Promise<void>((resolve) => {
                connection.on(event, async (msg) => {
                    await handler(msg);
                    connection.off(event, handler);
                    return resolve();
                });
            });
        },

        on(event: string, handler: MercuriosEventHandler): void {
            if (!_listeners[event]) {
                _listeners[event] = new Set();
            } else if (_listeners[event].has(handler)) {
                return;
            }

            _listeners[event].add(handler);
        },

        off(event: string, handler?: MercuriosEventHandler): void {
            if (!_listeners[event]) {
                return;
            } else if (!handler) {
                _listeners[event].clear();
                return;
            } else if (_listeners[event].has(handler)) {
                _listeners[event].delete(handler);
            }

            return;
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
                /** @todo: maybe this is part of the connect logic, not send? */
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
