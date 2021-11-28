import { Store } from "../store";
import { StoreEventListener } from "../store/static";
import { createLogger } from "../utils/logger";
import { EventFilters, ListTopicsOptions, MercuriosEvent } from "./interfaces";
import { AppendOptions } from "./interfaces";
import { ConnectOptions } from "./interfaces";

export type MercuriosClient = ReturnType<typeof MercuriosClient>;
export function MercuriosClient({
    url,
    debug = false,
    tablePrefix,
}: ConnectOptions) {
    let logger = createLogger({
        debug,
    });

    let store = Store({ url, logger, tablePrefix });

    let client = {
        async append<T = any>(
            topic: string,
            options: AppendOptions = {}
        ): Promise<MercuriosEvent<T>> {
            let _store = await store;

            return await _store.insert({
                topic,
                ...options,
            });
        },

        async read<T = any>(
            topic: string,
            seq: number | "latest"
        ): Promise<MercuriosEvent<T> | undefined> {
            let _store = await store;

            let event =
                seq === "latest"
                    ? await _store.latest(topic)
                    : await _store.fetch(topic, seq);

            return event;
        },

        async filter<T = any>(
            topic: string,
            filters: EventFilters = {}
        ): Promise<MercuriosEvent<T>[]> {
            return await (await store).filter(topic, filters);
        },

        async topics(filters: ListTopicsOptions = {}): Promise<string[]> {
            return await (await store).topics(filters);
        },

        async deleteTopic(topic: string): Promise<void> {
            await (await store).deleteTopic(topic);
        },

        async topicExists(topic: string): Promise<boolean> {
            return await (await store).topicExists(topic);
        },

        on: ((event, handler) => {
            store.then((store) => {
                store.on(event, handler);
                logger.debug({ handler }, `subscription created`);
            });
        }) as StoreEventListener,
    };

    logger.debug(`mercurios client initialized in debug mode`);

    return client;
}
