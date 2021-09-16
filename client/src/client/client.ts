import { MercuriosEvent } from "../event/event";
import { StoreFactory } from "../store/store";
import { EventFilters, ListTopicsOptions } from "../store/store.interfaces";
import { PublishOptions } from "./client.interfaces";

export type MercuriosClient = ReturnType<typeof MercuriosClient>;
export function MercuriosClient({ driver = "pg", url }) {
    let store = StoreFactory({ driver, url });

    let client = {
        async publish(
            topic: string,
            options: PublishOptions = {}
        ): Promise<MercuriosEvent> {
            let _store = await store;

            let event = await _store.append({
                topic,
                ...options,
                timestamp: new Date().toISOString(),
            });

            return event;
        },

        async read(
            topic: string,
            seq: number | "latest"
        ): Promise<MercuriosEvent | undefined> {
            let _store = await store;
            let event =
                seq === "latest"
                    ? await _store.latest(topic)
                    : await _store.read(topic, seq);

            return event;
        },

        async filter(topic: string, filters: EventFilters = {}) {
            let _store = await store;

            return await _store.filter(topic, filters);
        },

        async topics(filters: ListTopicsOptions = {}) {
            let _store = await store;

            return await _store.topics(filters);
        },
    };

    return client;
}
