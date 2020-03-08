import axios from "axios";
import ws from "ws";

interface MercuriosEventHandler<T = any> {
    (event: MercuriosEvent<T>): void;
}

export interface MercuriosEvent<T = any> {
    topic: string;
    seq: number;
    published_at: string;
    data: T;
}

export class MercuriosClient {
    private _wsc: ws | undefined;
    private _listeners: Record<string, MercuriosEventHandler[]> = {};

    public constructor(private readonly _url: string) {}

    private emit(topic: string, event: MercuriosEvent) {
        if (!this._listeners[topic]) {
            return;
        }

        this._listeners[topic].forEach(listener => listener(event));
    }

    private on(event: string, handler: MercuriosEventHandler) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        } else if (this._listeners[event].includes(handler)) {
            return;
        }

        this._listeners[event].push(handler);
    }

    private wsc(): ws {
        if (this._wsc) {
            return this._wsc;
        }

        this._wsc = new ws(this._url);

        this._wsc.once("close", () => {
            this._wsc?.terminate();
            this._listeners = {};
            this._wsc = undefined;
        });

        this._wsc.on("error", err => {
            throw err;
        });

        this._wsc.on("message", msg => {
            let event: MercuriosEvent = JSON.parse(msg.toString());

            this.emit(event.topic, event);
        });

        return this._wsc;
    }

    async createStream(topic: string, schema?: any) {
        let response = await axios.post(`${this._url}/streams`, {
            topic,
            schema,
        });
    }

    async publish<T = any>(
        topic: string,
        data: any,
        expectedSeq?: number
    ): Promise<MercuriosEvent<T>> {
        try {
            const response = await axios.post(`${this._url}/stream/${topic}`, {
                data,
                expectedSeq,
            });

            return response.data;
        } catch (err) {
            throw err.response ? new Error(err.response.data) : err;
        }
    }

    async read<T = any>(
        topic: string,
        seq: number
    ): Promise<MercuriosEvent<T> | null> {
        try {
            const response = await axios.get(
                `${this._url}/stream/${topic}/${seq}`
            );
            return response.data;
        } catch (err) {
            if (err.response?.status === 204) {
                return null;
            }

            throw err.response ? new Error(err.response.data) : err;
        }
    }

    async subsribe<T = any>(
        topic: string,
        handler: MercuriosEventHandler<T>
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let socket = this.wsc();
            this.on(topic, handler);

            const action = () => {
                socket.send(
                    JSON.stringify({
                        action: "subscribe",
                        options: {
                            topic,
                        },
                    }),
                    err => {
                        if (err) {
                            reject(err);
                        }
                        resolve();
                    }
                );
            };

            if (socket.readyState === socket.OPEN) {
                action();
            } else {
                socket.once("open", action);
            }
        });
    }

    async unsubscribe(topic: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let socket = this.wsc();

            const action = () => {
                socket.send(
                    JSON.stringify({
                        action: "unsubscribe",
                        options: {
                            topic,
                        },
                    }),
                    err => {
                        if (err) {
                            reject(err);
                        }
                        delete this._listeners[topic];
                        resolve();
                    }
                );
            };

            if (socket.readyState === socket.OPEN) {
                action();
            } else {
                socket.once("open", action);
            }
        });
    }
}

export default {
    connect({ url }: { url: string }): MercuriosClient {
        return new MercuriosClient(url);
    },
};
