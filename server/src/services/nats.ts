import * as nats from "ts-nats";
import { $config } from "../utils/config";
import $error from "../utils/error";
import { $logger } from "../utils/logger";

const NATS_URL = $config.nats_url;

const CLIENT = connect(`mercurios:server:${process.pid}`);

export async function connect(name: string): Promise<nats.Client> {
    return nats.connect(<nats.NatsConnectionOptions>{
        name: name,
        url: NATS_URL,
        payload: nats.Payload.JSON,
    });
}

export async function publish(topic: string, message: any): Promise<void> {
    return (await CLIENT).publish(topic, message);
}

export async function subscribe(
    topic: string,
    handler: nats.MsgCallback,
    options?: nats.SubscriptionOptions
): Promise<nats.Subscription> {
    return (await CLIENT).subscribe(topic, handler, options);
}

export async function isHealthy(): Promise<boolean> {
    try {
        await new Promise<void>(async (resolve, reject) => {
            let _client = await CLIENT;

            _client.subscribe(
                "mercurios_ping",
                (msg) => {
                    $logger.debug(msg, "ping message");
                    resolve();
                },
                <nats.SubscriptionOptions>{
                    max: 1,
                }
            );

            _client.publish("mercurios_ping", {
                rick: "sanchez",
            });

            setTimeout(
                () =>
                    reject(
                        $error.InternalError(
                            "timeout exceeded waiting while waiting for nats ping response"
                        )
                    ),
                1000
            );
        });

        return true;
    } catch (err) {
        $logger.error(err);
        return false;
    }
}

export const $nats = {
    connect,
    publish,
    subscribe,
    isHealthy,
};

export default $nats;
