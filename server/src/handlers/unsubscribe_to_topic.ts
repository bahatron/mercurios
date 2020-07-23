import { WsRequestHandler } from "../http/ws_connection";
import { Subscription } from "ts-nats";

export default <WsRequestHandler>(
    async function unsubscribeToTopic({ subscription, topic, connection }) {
        connection.logger.debug("unsubscribing to topic", {
            subscription,
        });

        if (!subscription || !connection.subscriptions.has(subscription)) {
            return;
        }

        let sub = connection.subscriptions.get(subscription) as Subscription;

        sub.unsubscribe();

        connection.subscriptions.delete(subscription);

        connection.logger.debug("removed subscription", {
            subscription,
            topic,
        });
    }
);
