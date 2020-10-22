import ws from "ws";
import { $error } from "../utils/error";
import { v4 } from "uuid";
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

export function Connection(_url: string, _id: string = v4()) {
    let _queue: Array<QueuedHandler> = [];
    let _socket = connect();
    let _interval: any;
    let _listeners: Record<string, Set<MercuriosEventHandler>> = {};

    function Socket(): ws | WebSocket {
        try {
            if (typeof window === "undefined") {
                return new ws(_url, <ws.ClientOptions>{});
            }

            let browserUrl = new URL(_url);

            return new WebSocket(
                `${browserUrl.hostname}${
                    browserUrl.port ? `:${browserUrl.port}` : ""
                }${_id ? `?id=${_id}` : ""}`,
                "ws"
            );
        } catch (err) {
            $logger.error(err);

            throw $error.ConnectionError(
                "error connecting to mercurios WS server",
                {
                    url: _url,
                    id: _id,
                    message: err.message,
                }
            );
        }
    }

    function connect() {
        $logger.debug(`connecting...`);
        let socket = Socket();

        socket.onopen = async function onSocketOpen() {
            if (process.env.MERCURIOS_ENV !== "production") {
                $logger.debug("socket open");
            }

            let action: QueuedHandler | undefined;

            while ((action = _queue.pop())) {
                await action();
            }
        };

        socket.onmessage = function onSocketMessage(message: any) {
            let { subscription, subject, event } = JSON.parse(
                (message.data ?? message).toString()
            );

            connection.emit(subscription, { subscription, subject, event });

            $logger.debug("message received", { subscription, subject, event });
        };

        socket.onerror = async function onSocketError({ message, error }: any) {
            $logger.debug(`socket error`, { message });

            if (process.env.NODE_ENV !== "production") {
                console.log({ on: "onError", message, error });
            }

            reconnect();
        };

        socket.onclose = function onSocketClose({ wasClean, code }: any) {
            $logger.debug(`socket closed`, { wasClean, code });

            if (process.env.NODE_ENV !== "production") {
                console.log({ on: "onClose", wasClean, code });
            }

            if (code == 1000) {
                return;
            }

            reconnect();
        };

        return socket;
    }

    async function reconnect() {
        $logger.debug(`reconnecting...`);
        if (_interval) {
            $logger.debug(`already reconnecting.`);
            return;
        }

        _interval = setInterval(async () => {
            if (_socket && _socket.readyState === _socket.OPEN) {
                clearInterval(_interval);
                _interval = undefined;
                return;
            }

            _socket = connect();
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
            new Promise((resolve) => {
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
            _socket.close(1000);
        },

        isOpen() {
            return _socket.readyState === _socket.OPEN;
        },

        send(message: ServerMessage): Promise<void> {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject($error.ConnectionError("could not connect"));
                }, 5000);

                try {
                    const action = () => {
                        _socket.send(JSON.stringify(message));

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
