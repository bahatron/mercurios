import ws from "ws";
import $logger from "../services/logger";
import { Client, Subscription } from "ts-nats";
import $error from "../services/error";
import $json from "../services/json";
import { IncomingMessage } from "http";
import $nats from "../services/nats";
import uuid from "uuid";
import url from "url";

export class WsConnection {
    private _subscriptions: Map<string, Subscription> = new Map();
    private dispatcher: Promise<Client>;
    public readonly id: string;

    constructor(
        public readonly request: IncomingMessage,
        public readonly socket: ws
    ) {
        let query = url.parse(request.url ?? "", true).query;
        this.id = typeof query.id === "string" ? query.id : uuid.v4();

        this.setupSocket();
        this.dispatcher = $nats.connect(`wsc_${this.id}`);
    }

    private setupSocket() {
        this.socket.on("message", (data) => {
            try {
                let { action, topic, queue } = $json.parse(data);

                $logger.debug(
                    `wsc_${this.id} - message received - action: ${action} topic: ${topic} queue: ${queue}`
                );

                switch (action) {
                    case "subscribe":
                        return this._subscribe(topic, queue);
                    case "unsubscribe":
                        return this._unsubscribe(topic);
                    default:
                        return;
                }
            } catch (err) {
                $logger.warning(
                    `wsc_${this.id} - message error: ${err.message}`,
                    err
                );
            }
        });

        this.socket.on("unexpected-response", (req, res) => {
            $logger.warning(`ws_${this.id} - unexpected respose`, req);
        });

        this.socket.on("close", async () => {
            $logger.debug(`wsc_${this.id} - closed`);
            await this.close();
        });

        this.socket.on("error", async (err) => {
            $logger.error(err);
            await this.close();
        });
    }

    private async _subscribe(topic: string, queue?: string) {
        if (!topic) {
            return;
        }

        if (this._subscriptions.has(topic)) {
            $logger.debug(
                `wsc_${this.id} - already subscribed - topic: ${topic}`
            );
            return;
        }

        $logger.debug(`wsc_${this.id} - subscribing - topic: ${topic}`);

        this._subscriptions.set(
            topic,
            await (await this.dispatcher).subscribe(
                `topic.${topic}`,
                (err, msg) => {
                    return new Promise((resolve) => {
                        if (err) {
                            $logger.error(err);
                            throw err;
                        }

                        $logger.debug(
                            `wsc_${this.id} - event recieved - topic: ${msg.data.topic}`
                        );

                        let interval = setInterval(() => {
                            $logger.debug(
                                `wsc_${this.id} - waiting for buffer to be clear`
                            );
                            if (this.socket.bufferedAmount === 0) {
                                this.socket.send(
                                    $json.stringify(msg.data),
                                    (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        clearInterval(interval);
                                        resolve();
                                    }
                                );
                            }
                        }, 50);

                        $logger.debug(
                            `wsc_${this.id} - event sent - topic: ${msg.data.topic}`
                        );
                    });
                },
                {
                    queue: queue || undefined,
                }
            )
        );

        $logger.debug(`wsc_${this.id} - subscribed - topic: ${topic}`);
    }

    private _unsubscribe(topic: string) {
        let sub = this._subscriptions.get(topic);

        if (!sub) {
            return;
        }

        sub.unsubscribe();
        this._subscriptions.delete(topic);

        $logger.debug(`wsc_${this.id} - unsubscribed - topic: ${topic}`);
    }

    public async close() {
        if (!(await this.dispatcher).isClosed()) {
            await (await this.dispatcher).drain();
            await (await this.dispatcher).close();
        }

        this.socket.terminate();
    }
}
