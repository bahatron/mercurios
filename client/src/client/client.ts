import { MercuriosEvent } from "../event/event";
import { StoreFactory } from "../store/store";
import { EventFilters, ListTopicsOptions } from "./client.interfaces";
import { createLogger } from "../utils/logger";
import { AppendOptions } from "./client.interfaces";
import { ConnectOptions } from "./client.interfaces";

export type MercuriosClient = ReturnType<typeof MercuriosClient>;
export function MercuriosClient({ url, debug = false }: ConnectOptions) {
    let logger = createLogger({ debug });
    let store = StoreFactory({ url });

    let client = {
        async append(
            topic: string,
            options: AppendOptions = {}
        ): Promise<MercuriosEvent> {
            let _store = await store;

            let event = await _store.insert({
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

        async filter(
            topic: string,
            filters: EventFilters = {}
        ): Promise<MercuriosEvent[]> {
            let _store = await store;

            let result = await _store.filter(topic, filters);

            return result;
        },

        async topics(filters: ListTopicsOptions = {}): Promise<string[]> {
            let _store = await store;

            return await _store.topics(filters);
        },

        async deleteTopic(topic: string): Promise<void> {
            await (await store).deleteTopic(topic);
        },

        async topicExists(topic: string): Promise<boolean> {
            return await (await store).topicExists(topic);
        },
    };

    return client;
}
