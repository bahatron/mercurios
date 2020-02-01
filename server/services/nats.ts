import * as nats from "ts-nats";
import $config from "./config";

const NATS_URL = $config.NATS.url;

const CLIENT = connect(`mercurios_server_${process.pid}`);

export async function connect(name: string): Promise<nats.Client> {
    return nats.connect({
        name: name,
        url: NATS_URL,
        payload: nats.Payload.JSON,
    });
}

async function publish(topic: string, message: any): Promise<void> {
    return (await CLIENT).publish(topic, message);
}

async function subscribe(
    topic: string,
    handler: nats.MsgCallback,
    options?: nats.SubscriptionOptions
): Promise<nats.Subscription> {
    return (await CLIENT).subscribe(topic, handler, options);
}

const $nats = {
    connect,
    publish,
    subscribe,
};

export default $nats;
