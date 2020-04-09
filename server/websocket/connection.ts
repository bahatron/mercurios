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
    private _subscriptions: Record<string, Subscription> = {};
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
                let { action, topic } = $json.parse(data);

                $logger.debug(`ws connection - got message from client`, {
                    action,
                    topic,
                });

                switch (action) {
                    case "subscribe":
                        this.subscribe(topic);
                    case "unsubscribe":
                        this.unsubscribe(topic);
                    default:
                        return;
                }
            } catch (err) {
                $logger.warning(
                    `ws connection - message error: ${err.message}`,
                    err
                );
            }
        });

        this.socket.on("unexpected-response", (req, res) => {
            $logger.warning(
                `ws - unexpected respose - request_id: ${req.getHeader(
                    "REQUEST_ID"
                )}`,
                req
            );
        });

        this.socket.on("close", async () => {
            $logger.warning(`ws connection closed - id: ${this.id}`);
            await this.close();
        });

        this.socket.on("error", async (err) => {
            $logger.warning(`ws - coonection error`, {
                msg: err.message,
                name: err.name,
            });
            $logger.error(err);
            await this.close();
        });
    }

    private async subscribe(topic: string) {
        if (!topic) {
            throw $error.ExpectationFailed(
                `ws connection - no topic for subscripton`
            );
        }

        $logger.debug(`ws connection - subscribing to ${topic}`, {
            id: this.id,
        });

        if (this._subscriptions[topic]) {
            $logger.debug(
                `ws connection - already subscribed to ${topic}, ignoring`,
                { id: this.id }
            );
            return;
        }

        this._subscriptions[topic] = await (await this.dispatcher).subscribe(
            `topic.${topic}`,
            (err, msg) => {
                $logger.debug(
                    `ws connection - recieved dispatched event - topic: ${msg.data.topic}`
                );
                if (err) {
                    $logger.warning(
                        `ws connection - subscribe error: ${err.message}`
                    );
                }

                this.socket.send($json.stringify(msg.data));
            }
        );

        $logger.info(`ws connection - subscribed to topic ${topic}`);
    }

    private unsubscribe(topic: string) {
        let sub = this._subscriptions[topic];

        if (!sub) {
            return;
        }

        sub.unsubscribe();

        delete this._subscriptions[topic];
    }

    public async close() {
        await this.socket.terminate();

        if (!(await this.dispatcher).isClosed()) {
            await (await this.dispatcher).drain();
            await (await this.dispatcher).close();
        }
    }
}
