import ws from "ws";
import { $error } from "../utils/error";
import { v4 } from "uuid";

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

function Socket(_url: string, _id: string = v4()): ws | WebSocket {
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

export function Connection(_url: string, _id?: string) {
    let _queue: Array<() => void> = [];
    let _socket = connect(_url, _id);
    let _interval: any;
    let _listeners: Record<string, Set<MercuriosEventHandler>> = {};

    async function onSocketOpen() {
        if (process.env.NODE_ENV !== "production") {
            console.log(`DEBUG: socket open`);
        }

        let action: (() => void) | undefined;

        while ((action = _queue.pop())) {
            if (action) {
                await action();
            }
        }
    }

    function onSocketMessage(message: any) {
        let { subscription, subject, event } = JSON.parse(
            (message.data ?? message).toString()
        );

        connection.emit(subscription, { subscription, subject, event });
    }

    async function reconnect() {
        if (_interval) {
            return;
        }

        _interval = setInterval(async () => {
            if (_socket && _socket.readyState === _socket.OPEN) {
                clearInterval(_interval);
                _interval = undefined;
                return;
            }

            _socket = connect(_url, _id);
        }, 1000);
    }

    function connect(url: string, id?: string) {
        let socket = Socket(url, id);

        socket.onopen = onSocketOpen;
        socket.onmessage = onSocketMessage;
        socket.onerror = function ({ message, error }: any) {
            if (process.env.NODE_ENV !== "production") {
                console.log({ on: "onError", message, error });
            }

            reconnect();
        };

        socket.onclose = function ({ wasClean, code }: any) {
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
