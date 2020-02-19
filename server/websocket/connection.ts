import $ws from "ws";
import $logger from "../services/logger";
import { Client, Subscription } from "ts-nats";
import $error from "../services/error";
import $json from "../services/json";
import { IncomingMessage } from "http";
import $nats from "../services/nats";

interface ActionContext {
    id: string;
    socket: $ws;
    dispatcher: Client;
    options?: any;
}

const _actions: Record<string, (context: ActionContext) => void> = {
    subscribe: ({ id, socket, dispatcher, options }: ActionContext) => {
        $logger.info(`ws connection - subscribed to topic ${options.topic}`);

        let { topic } = $json.parse(options);

        if (!topic) {
            throw $error.ExpectationFailed(
                `ws connection - no topic for subscripton`
            );
        }

        dispatcher.subscribe(`stream.${topic}`, (err, msg) => {
            $logger.debug(
                `ws connection - event on subscribed received: ${msg.data.topic}`
            );
            if (err) {
                $logger.warning(`ws conn - subscribe error: ${err.message}`);
            }

            socket.send($json.stringify(msg.data));
        });
    },

    subscribe_all: ({ id, socket, dispatcher, options }: ActionContext) => {
        dispatcher.subscribe(`stream.*`, (err, msg) => {
            socket.send($json.stringify(msg.data));
        });
    },
};

export interface ConnectionParams {
    id: string;
    socket: $ws;
    request: IncomingMessage;
}

export class WsConnection {
    private _subscriptions: Subscription[] = [];

    constructor(
        public readonly id: string,
        public readonly request: IncomingMessage,
        public readonly socket: $ws,
        private dispatcher: Client
    ) {
        this.socket.on("message", data => {
            // let { action, options }: ClientMessage = $json.parse(data);
            try {
                let { action, options } = $json.parse(data);

                $logger.debug(`ws connection - got message from client`, {
                    action,
                    options,
                });

                _actions[action]({
                    id,
                    socket: this.socket,
                    dispatcher: this.dispatcher,
                    options,
                });
            } catch (err) {
                $logger.warning("ws connection - message error", err);
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
            $logger.warning(`ws - connection closed - id: ${id}`);
            await this.close();
        });

        this.socket.on("error", async err => {
            $logger.warning(`ws - coonection error - ${err.message}`);
            $logger.error(err);
            await this.close();
        });
    }

    public async close() {
        await this.socket.terminate();

        if (!this.dispatcher.isClosed()) {
            await this.dispatcher.drain();
            await this.dispatcher.close();
        }
    }
}

export default async function $connection({
    id,
    socket,
    request,
}: ConnectionParams): Promise<WsConnection> {
    let dispatcher = await $nats.connect(`ws_client_${id}`);

    return new WsConnection(id, request, socket, dispatcher);
}
