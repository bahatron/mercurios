import { Connection } from "../http/ws_connection";

export default async function (connection: Connection, topic: string) {
    let sub = connection.subscriptions.get(topic);

    if (!sub) {
        return;
    }

    sub.unsubscribe();
    connection.subscriptions.delete(topic);
}
