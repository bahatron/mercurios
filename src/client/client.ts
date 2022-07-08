import { Store } from "../store";
import { createLogger } from "../utils/logger";
import { EventFilters, ListTopicsOptions, MercuriosEvent } from "./interfaces";
import { AppendOptions } from "./interfaces";
import { ConnectOptions } from "./interfaces";

export type MercuriosClient = ReturnType<typeof MercuriosClient>;
export function MercuriosClient({
    url,
    debug = false,
    tablePrefix = "mercurios",
    onEvent,
}: ConnectOptions) {
    let logger = createLogger({
        debug,
    });

    let _store = Store({ url, logger, tablePrefix });

    let client = {
        async append<T = any>(
            topic: string,
            options: AppendOptions = {}
        ): Promise<MercuriosEvent<T>> {
            let store = await _store;

            let event = await store.insert({
                topic,
                ...options,
            });

            onEvent?.(event);

            return event;
        },

        async read<T = any>(
            topic: string,
            seq: number | "latest"
        ): Promise<MercuriosEvent<T> | undefined> {
            let store = await _store;

            return seq === "latest"
                ? store.latest(topic)
                : store.fetch(topic, seq);
        },

        async filter<T = any>(
            topic: string,
            filters: EventFilters = {}
        ): Promise<MercuriosEvent<T>[]> {
            return (await _store).filter(topic, filters);
        },

        async topics(filters: ListTopicsOptions = {}): Promise<string[]> {
            return (await _store).topics(filters);
        },

        async deleteTopic(topic: string): Promise<void> {
            await (await _store).deleteTopic(topic);
        },

        async topicExists(topic: string): Promise<boolean> {
            return (await _store).topicExists(topic);
        },
    };

    logger.debug(`mercurios client initialized in debug mode`);

    return client;
}
