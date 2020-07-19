import ws from "ws";
import { type } from "os";

export interface MercuriosMessage {
    subscription: string;
    subject: string;
    event: MercuriosEvent;
}

export interface MercuriosEvent {
    topic: string;
    seq: number;
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

function Socket(_url: string, _id?: string): ws | WebSocket {
    if (typeof window === "undefined") {
        return new ws(_url, <ws.ClientOptions>{});
    }

    let browserUrl = new URL(_url);

    return new WebSocket(
        `${browserUrl.hostname}${browserUrl.port ? `:${browserUrl.port}` : ""}${
            _id ? `?id=${_id}` : ""
        }`,
        "ws"
    );
}

export function Connection(_url: string, _id?: string) {
    let _socket = Socket(_url);
    let _listeners: Record<string, Set<MercuriosEventHandler>> = {};
    let _queue: Array<() => void> = [];

    _socket.onclose = function onSocketClose() {
        // _listeners = {};
        // _queue = [];
    };

    _socket.onopen = async function onSocketOpen() {
        let action: (() => void) | undefined;

        while ((action = _queue.pop())) {
            if (action) {
                await action();
            }
        }
    };

    _socket.onerror = function onSocketError(err: any) {
        connection.close();
        connection;
        if (err) {
            throw err;
        }
    };

    _socket.onmessage = function onSocketMessage(message: any) {
        let { subscription, subject, event } = JSON.parse(
            (message.data ?? message).toString()
        );

        connection.emit(subscription, { subscription, subject, event });
    };

    let connection = {
        emit(event: string, message: MercuriosMessage): void {
            if (!_listeners[event]) {
                return;
            }

            _listeners[event].forEach((listener) => listener(message));
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
            _socket.close();
        },

        isOpen() {
            return _socket.readyState === _socket.OPEN;
        },

        send(message: ServerMessage): Promise<void> {
            return new Promise((resolve, reject) => {
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
