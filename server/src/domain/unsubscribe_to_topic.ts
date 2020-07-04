import { Connection, WsRequestHandler } from "../http/ws_connection";
import $logger from "../utils/logger";

export default <WsRequestHandler>(
    async function unsubscribeToTopic({ subscription, connection, topic }) {
        $logger.debug("unsubscribing to topic", { subscription, topic });

        let sub = connection.subscriptions.get(topic);

        if (!sub) {
            return;
        }

        sub.unsubscribe();

        connection.subscriptions.delete(topic);
    }
);
