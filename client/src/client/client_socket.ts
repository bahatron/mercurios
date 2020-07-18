import ws from "ws";

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

function wsc(url: string): ws | WebSocket {
    return new ws(url);
}

export function ClientSocket(_url: string, _id?: string) {
    let _socket = wsc(_url);
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
        socket.close();

        if (err) {
            throw err;
        }
    };

    _socket.onmessage = function onSocketMessage(message: any) {
        let { subscription, subject, event } = JSON.parse(
            (message.data ?? message).toString()
        );

        socket.emit(subscription, { subscription, subject, event });
    };

    let socket = {
        emit(topic: string, message: MercuriosMessage): void {
            if (!_listeners[topic]) {
                return;
            }

            _listeners[topic].forEach((listener) => listener(message));
        },

        once(event: string, handler: MercuriosEventHandler): void {
            new Promise((resolve) => {
                socket.on(event, async (msg) => {
                    await handler(msg);
                    socket.off(event, handler);
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

                    if (socket.isOpen()) {
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

    return socket;
}
