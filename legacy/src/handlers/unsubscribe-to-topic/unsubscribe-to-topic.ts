import { WsRequestHandler } from "../../http/websocket/ws-connection";
import { Subscription } from "ts-nats";

export default <WsRequestHandler>(
    async function unsubscribeToTopic({ subscription, topic, connection }) {
        connection.logger.debug(
            {
                subscription,
                topic,
            },
            "unsubscribing to topic"
        );

        if (!subscription || !connection.subscriptions.has(subscription)) {
            return;
        }

        let sub = connection.subscriptions.get(subscription) as Subscription;

        sub.unsubscribe();

        connection.subscriptions.delete(subscription);

        connection.logger.debug(
            {
                subscription,
                topic,
            },
            "removed subscription"
        );
    }
);
