import { MercuriosEvent } from "../models/event";
import { StoreFactory } from "../store/store";
import { PublishOptions } from "./client.interfaces";

export function MercuriosClient({ driver = "pg", url }) {
    let store = StoreFactory({ driver, url });

    let client = {
        async publish(
            topic: string,
            options: PublishOptions = {}
        ): Promise<MercuriosEvent> {
            let event = await (await store).append({ topic, ...options });

            return event;
        },
    };

    return client;
}
