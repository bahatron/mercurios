import { Logger } from "@bahatron/utils";
import { EventFilters, ListTopicsOptions, MercuriosEvent } from "../client";

export interface InsertOptions {
    topic: string;
    expectedSeq?: number;
    key?: string;
    data?: any;
}

export type StoreEvent = "event";

export interface StoreEventListener {
    (event: StoreEvent, handler: (event: MercuriosEvent) => void): void;
}

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
    on: StoreEventListener;
}

export interface CreateStoreOptions {
    url: string;
    logger: Logger.Logger;
    tablePrefix: string;
}

export interface StoreFactory {
    (params: CreateStoreOptions): Promise<StoreDriver>;
}
