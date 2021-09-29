import { Logger } from "@bahatron/utils/lib/logger";
import { MercuriosEvent } from "../event/event";
import { StoreFactory } from "../store";
import { EventFilters, ListTopicsOptions } from "./interfaces";
import { AppendOptions } from "./interfaces";
import { ConnectOptions } from "./interfaces";

export type MercuriosClient = ReturnType<typeof MercuriosClient>;
export function MercuriosClient({ url, debug = false }: ConnectOptions) {
    let logger = Logger({
        debug,
        pretty: process.env.MERCURIOS_DEV === "1",
    });

    let store = StoreFactory({ url, logger });

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

            logger.debug(event, "mercurios event created");

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

            logger.debug({ topic }, `topic deleted`);
        },

        async topicExists(topic: string): Promise<boolean> {
            return await (await store).topicExists(topic);
        },
    };

    logger.debug(`mercurios client initialized in debug mode`);

    return client;
}
