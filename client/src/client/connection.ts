import $ws, { ClientOptions } from "ws";
import { $error } from "../utils/error";
import { Logger } from "@bahatron/utils";
import { $logger } from "../utils/logger";

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
    let _reconnectInterval: any;
    let _listeners: Record<string, Set<MercuriosEventHandler>> = {};

    let intervalSleep = 18000000;
    let _intervalRefresh = setInterval(() => {
        $logger.debug(
            {
                intervalSleep: intervalSleep / 1000,
                unit: "seconds",
            },
            `refreshing connection after interval`
        );

        _socket?.close(1000);
        _socket = connect();
    }, intervalSleep);

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
            clearInterval(_intervalRefresh);
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

    function Socket(): $ws | WebSocket {
        try {
            if (typeof window === "undefined") {
                let ws = new $ws(_url, <ClientOptions>{});
                let _timeout: NodeJS.Timeout | undefined;
                let _interval: NodeJS.Timeout;

                function ping() {
                    _timeout = setTimeout(() => {
                        /** @todo: maybe a different error type? */
                        throw $error.ConnectionError("ping timeout");
                    }, 1000);
                    $logger.debug(`pinging server...`);
                }

                ws.on("pong", () => {
                    clearTimeout(_timeout!);
                    $logger.debug(`pong received`);
                });

                ws.on("open", () => {
                    _interval = setInterval(ping, 30000);
                });

                ws.on("close", () => {
                    clearInterval(_interval);
                });

                return ws;
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
                "error connecting to mercurios ws server",
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
                _logger.info("ws connection open");

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
                    {
                        subscription,
                        topic: event.topic,
                    },
                    "ws message received"
                );
            };

            socket.onerror = async function onSocketError({
                message,
                error,
            }: any) {
                _logger.error(
                    {
                        message,
                        error,
                    },
                    "ws error"
                );

                setTimeout(reconnect, 1000);
            };

            socket.onclose = function onSocketClose({ wasClean, code }: any) {
                if (code == 1000 && wasClean) {
                    return;
                }

                _logger.warning(
                    {
                        wasClean,
                        code,
                    },
                    `ws connection closed`
                );

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
                clearInterval(_reconnectInterval);
                _reconnectInterval = undefined;
                return;
            }

            _socket = connect();

            if (!_socket) {
                _logger.warning("unsuccessful ws connection, retrying...");
            }
        }, 1000);
    }

    return connection;
}
