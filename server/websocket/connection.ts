import { Client } from "ts-nats";
import $ws from "ws";
import { IncomingMessage } from "http";
import $logger from "../services/logger";
import $json from "../services/json";
import $error from "../services/error";

export interface ConnectionParams {
    id: string;
    dispatcher: Client;
    socket: $ws;
    request: IncomingMessage;
}

interface ActionContext {
    socket: $ws;
    dispatcher: Client;
    options?: any;
}

const _actions: Record<string, (context: ActionContext) => void> = {
    subscribe: ({ socket, dispatcher, options }: ActionContext) => {
        let { topic } = $json.parse(options);
        if (!topic) {
            throw $error.ExpectationFailed(
                `ws connection - no topic for subscripton`
            );
        }

        dispatcher.subscribe(`event_published`, (err, msg) => {
            $logger.debug(`ws connection - event msg`, msg);
            if (err) {
                $logger.warning(`ws conn - subscribe error: ${err.message}`);
            }

            if (msg.data.topic === topic) {
                socket.send($json.stringify(msg.data));
            }
        });
    },
};

interface ClientMessage {
    action: string;
    options: any;
}

const $connection = ({ id, dispatcher, socket, request }: ConnectionParams) => {
    $logger.warning(`config connection id ${id}`);

    socket.on("message", data => {
        let { action, options }: ClientMessage = $json.parse(data);

        $logger.debug(`message`, { action, options });

        _actions[action]({ socket, dispatcher, options });
    });

    return socket;
};

export default $connection;
