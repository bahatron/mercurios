import $nats, { Client } from "../adapters/nats";
import { Msg } from "ts-nats";
import $json from "./json";

export interface SubscriptionHandler {
    (err: Error | null, message: any, channel: string): void | Promise<void>;
}

export interface SubscribeOptions {
    queue?: boolean;
}

class EventDispatcher {
    private client: Promise<Client>;

    constructor(name: string) {
        this.client = $nats.client(name);
    }

    public connection(name: string) {
        return new EventDispatcher(name);
    }

    public async publish(channel: string, message?: any): Promise<void> {
        (await this.client).publish(channel, $json.stringify(message));
    }

    public async subscribe(
        channel: string,
        handler: SubscriptionHandler,
        options: SubscribeOptions = {}
    ): Promise<void> {
        let client = await this.client;

        const onSubscription = async (err: Error | null, msg: Msg) => {
            const { data, subject: channel } = msg;

            await handler(err, $json.parse(data), channel);
        };

        const { queue } = options;

        if (queue) {
            await client.subscribe(channel, onSubscription, {
                queue: channel
            });

            return;
        }

        await client.subscribe(channel, onSubscription);
    }
}

const $dispatcher = new EventDispatcher(`mercurios_pid_${process.pid}`);

export default $dispatcher;
