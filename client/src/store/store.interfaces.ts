import { MercuriosEvent } from "../models/event";

export interface StoreDriver {
    // event management
    append(event: AppendOptions): Promise<MercuriosEvent>;
    read(topic: string, seq: number): Promise<MercuriosEvent | undefined>;
    filter(topic: string, filters: EventFilters): Promise<MercuriosEvent[]>;
    latest(topic: string): Promise<MercuriosEvent | undefined>;
    // topic management
    deleteTopic(topic: string): Promise<void>;
    topicExists(topic: string): Promise<boolean>;
    topics(params: ListTopicsOptions): Promise<string[]>;
}

export interface ListTopicsOptions {
    like?: string;
    withEvents?: EventFilters;
    limit?: number;
    offset?: number;
}

export interface EventFilters {
    from?: number;
    to?: number;
    key?: string;
    before?: string;
    after?: string;
}

export type AppendOptions = Omit<MercuriosEvent, "seq"> & {
    expectedSeq?: number;
};
