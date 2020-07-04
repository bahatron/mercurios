import axios from "axios";
import ws from "ws";

export interface MercuriosEventHandler {
    (event: MercuriosMessage): void;
}

export interface MercuriosEvent {
    topic: string;
    seq: number;
    published_at: string;
    data: any;
}

export interface PublishOptions {
    data?: any;
    expectedSeq?: number;
}

export interface MercuriosMessage {
    subscription: string;
    topic: string;
    event: MercuriosEvent;
}

function randomString() {
    let generator = () => Math.random().toString(36).substring(2);

    return `${generator()}${generator()}`;
}

export class MercuriosClient {
    private _wsc: ws | WebSocket | undefined;
    private _listeners: Record<string, MercuriosEventHandler[]> = {};
    private _queued: Function[] = [];

    public constructor(
        private readonly _url: string,
        private readonly _id?: string
    ) {}

    private _emit(topic: string, message: MercuriosMessage) {
        if (!this._listeners[topic]) {
            return;
        }

        this._listeners[topic].forEach((listener) => listener(message));
    }

    private on(event: string, handler: MercuriosEventHandler) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        } else if (this._listeners[event].includes(handler)) {
            return;
        }

        this._listeners[event].push(handler);
    }

    private off(event: string) {
        if (!this._listeners[event]) {
            return;
        }

        this._listeners[event] = [];
    }

    private url() {
        return typeof window !== "undefined"
            ? new URL(this._url)
            : new (require("url").URL)(this._url);
    }

    private wsc() {
        if (this._wsc) {
            return this._wsc;
        }

        this._wsc =
            typeof window === "undefined"
                ? new ws(`${this._url}${this._id ? `?id=${this._id}` : ""}`)
                : new WebSocket(
                      `ws://${this.url().hostname}${
                          this.url().port ? `:${this.url().port}` : ""
                      }${this._id ? `?id=${this._id}` : ""}`
                  );

        this._wsc.onopen = async () => {
            let action: Function | undefined;

            while ((action = this._queued.shift())) {
                await action();
            }
        };

        this._wsc.onclose = () => {
            this._listeners = {};
            this._queued = [];
            this._wsc = undefined;
        };

        this._wsc.onerror = (err: any) => {
            this.close();

            throw err;
        };

        this._wsc.onmessage = (msg: any) => {
            let { subscription, topic, event } = JSON.parse(
                (msg.data ?? msg).toString()
            );

            this._emit(subscription, event);
            this._emit(topic, event);
        };

        return this._wsc;
    }

    async close() {
        this._wsc?.close();
    }

    async publish(
        topic: string,
        options?: PublishOptions
    ): Promise<MercuriosEvent> {
        let { data, expectedSeq } = options ?? {};
        try {
            const response = await axios.post(
                `${this._url}/publish/${topic}`,
                {
                    data,
                    expectedSeq,
                },
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );

            return response.data;
        } catch (err) {
            throw err;
        }
    }

    async emit(
        topic: string,
        options?: PublishOptions
    ): Promise<MercuriosEvent> {
        let { data } = options ?? {};
        try {
            const response = await axios.post(
                `${this._url}/emit/${topic}`,
                {
                    data,
                },
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );

            return response.data;
        } catch (err) {
            throw err;
        }
    }

    async read(topic: string, seq: number): Promise<MercuriosEvent | null> {
        try {
            const response = await axios.get(
                `${this._url}/read/${topic}/${seq}`,
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );
            return response.data;
        } catch (err) {
            switch (err.response?.status) {
                case 204:
                    return null;
                case 404:
                    let error = new Error("stream does not exist");
                    error.name = "NOSTREAM";
                    throw error;
                default:
                    throw err;
            }
        }
    }

    // mercurios.subscribe("topic", (event) => {// handle event here})
    async subscribe(
        topic: string,
        handler: MercuriosEventHandler,
        queue?: string
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                let socket = this.wsc();

                let subscription = randomString();

                this.on(subscription, handler);

                const action = () => {
                    socket.send(
                        JSON.stringify({
                            action: "subscribe",
                            topic,
                            subscription: subscription,
                            queue,
                        })
                    );

                    resolve();
                };

                if (socket.readyState === socket.OPEN) {
                    action();
                } else {
                    this._queued.push(action);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    async unsubscribe(topic: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                let socket = this.wsc();
                this.off(topic);

                const action = () => {
                    socket.send(
                        JSON.stringify({
                            action: "unsubscribe",
                            topic,
                        })
                    );

                    resolve();
                };

                if (socket.readyState === socket.OPEN) {
                    action();
                } else {
                    this._queued.push(action);
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}
