import { Logger } from "@bahatron/utils";
import { EventFilters, ListTopicsOptions, MercuriosEvent } from "../client";

export const STORE_VALUES = {
    EVENT_TABLE: `mercurios_events`,
    TOPIC_TABLE: `mercurios_topics`,
    APPEND_PROCEDURE: `append_event`,
    NOTIFICATION_CHANNEL: `mercurios_event_created`,
};

export interface InsertOptions {
    topic: string;
    timestamp: string;
    expectedSeq?: number;
    key?: string;
    data?: any;
}

export type StoreEvent = "event";

export interface StoreDriver {
    // event management
    insert(options: InsertOptions): Promise<MercuriosEvent>;
    fetch(topic: string, seq: number): Promise<MercuriosEvent | undefined>;
    filter(topic: string, filters: EventFilters): Promise<MercuriosEvent[]>;
    latest(topic: string): Promise<MercuriosEvent | undefined>;
    // topic management
    deleteTopic(topic: string): Promise<void>;
    topicExists(topic: string): Promise<boolean>;
    topics(params: ListTopicsOptions): Promise<string[]>;
    // listening
    on(event: StoreEvent, handler: (event: MercuriosEvent) => void): void;
}

export interface CreateStoreDriverOptions {
    url: string;
    logger: Logger.Logger;
}

export interface StoreDriverFactory {
    (params: CreateStoreDriverOptions): Promise<StoreDriver>;
}
