import { Connection, WsRequestHandler } from "../http/ws_connection";
import $json from "../utils/json";
import uuid from "uuid";
import { Subscription } from "ts-nats";
import $logger from "../utils/logger";

export default <WsRequestHandler>(
    async function subscribeToTopic({
        connection,
        topic,
        subscription = uuid.v4(),
        queue,
    }) {
        if (!topic || connection.subscriptions.has(subscription)) {
            return;
        }

        let sub: Subscription = await (await connection.dispatcher).subscribe(
            `topic.${topic}`,
            (err, msg) => {
                return new Promise((resolve) => {
                    connection.logger.debug(`subscription message received`, {
                        topic,
                        subscription,
                    });

                    if (err) {
                        connection.logger.error("error receiving message", err);
                        return;
                    }

                    connection.socket.send(
                        $json.stringify({
                            subscription,
                            subject: topic,
                            event: msg.data,
                        }),
                        (err) => {
                            if (err) {
                                connection.logger.error(
                                    "error sending message",
                                    err
                                );
                            }

                            resolve();
                        }
                    );
                });
            },
            {
                queue,
            }
        );

        connection.subscriptions.set(subscription, sub);

        $logger.debug(`subscribed to topic`, {
            subscription,
            topic,
        });
    }
);
