import { WsRequestHandler } from "../http/ws_connection";

export default <WsRequestHandler>(
    async function unsubscribeToTopic({ subscription, connection, topic }) {
        connection.logger.debug("unsubscribing to topic", {
            subscription,
            topic,
        });

        let sub = connection.subscriptions.get(topic);

        if (!sub) {
            return;
        }

        sub.unsubscribe();

        connection.subscriptions.delete(topic);

        connection.logger.debug("unsubscribed to topic successfully", {
            subscription,
            topic,
        });
    }
);
