import * as nats from "ts-nats";
import $env from "@bahatron/env";

const NATS_URL = $env.get("NATS_URL");

const CLIENT_NAME = `mercurios_server_${process.pid}`;
const CLIENT = _connect(CLIENT_NAME);

export async function _connect(name: string): Promise<nats.Client> {
    return nats.connect({
        name: name,
        url: NATS_URL,
        payload: nats.Payload.JSON,
    } as nats.NatsConnectionOptions);
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
    connect: _connect,
    publish,
    subscribe,
};

export default $nats;
