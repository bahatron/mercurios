import { Logger } from "@bahatron/utils";
import { EventFilters, ListTopicsOptions } from "../client";
import { MercuriosEvent } from "../event/event";

export interface InsertOptions {
    topic: string;
    timestamp: string;
    expectedSeq?: number;
    key?: string;
    data?: any;
}

export interface StoreDriver {
    // event management
    insert(options: InsertOptions): Promise<MercuriosEvent>;
    read(topic: string, seq: number): Promise<MercuriosEvent | undefined>;
    filter(topic: string, filters: EventFilters): Promise<MercuriosEvent[]>;
    latest(topic: string): Promise<MercuriosEvent | undefined>;
    // topic management
    deleteTopic(topic: string): Promise<void>;
    topicExists(topic: string): Promise<boolean>;
    topics(params: ListTopicsOptions): Promise<string[]>;
}

export interface CreateStoreDriverOptions {
    url: string;
    logger: Logger.Logger;
}

export interface StoreDriverFactory {
    (params: CreateStoreDriverOptions): Promise<StoreDriver>;
}
