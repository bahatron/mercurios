import { EventFilters, ListTopicsOptions, AppendOptions } from "../client";
import { MercuriosEvent } from "../event/event";

export interface InsertOptions {
    topic: string;
    expectedSeq?: number;
    timestamp: string;
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