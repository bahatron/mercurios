import { Connection } from "../http/ws_connection";
import $json from "../utils/json";

export default async function (
    connection: Connection,
    topic: string,
    queue?: string
) {
    if (!topic || connection.subscriptions.has(topic)) {
        return;
    }

    connection.subscriptions.set(
        topic,
        await (await connection.dispatcher).subscribe(
            `topic.${topic}`,
            (err, msg) => {
                return new Promise((resolve) => {
                    if (err) {
                        connection.logger.error("error receiving message", err);
                        return;
                    }

                    connection.socket.send($json.stringify(msg.data), (err) => {
                        if (err) {
                            connection.logger.error(
                                "error sending message",
                                err
                            );
                        }

                        resolve();
                    });
                });
            },
            {
                queue,
            }
        )
    );
}
