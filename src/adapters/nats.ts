import * as nats from "ts-nats";
import $env from "@bahatron/env";

const NATS_URL = $env.get("NATS_URL", "nats://nats:4222");

nats.Subscription
const $nats = {
    async client(name: string): Promise<nats.Client> {
        return nats.connect({
            name: name,
            url: NATS_URL,
        });
    },
};

export type Client = nats.Client;
export type MsgCallback = nats.MsgCallback;
export default $nats;
