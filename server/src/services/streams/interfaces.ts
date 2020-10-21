import { MercuriosEvent } from "../../models/event";

export interface EventStore {
    append(event: MercuriosEvent): Promise<MercuriosEvent>;
    read(topic: string, seq: number): Promise<MercuriosEvent | undefined>;
    deleteStream(topic: string): Promise<void>;
    streamExists(topic: string): Promise<boolean>;
    filter(topic: string, query: FilterParams): Promise<MercuriosEvent[]>;
    topics(filter?: string): Promise<string[]>;
}

/** @todo: time filtering */
export interface FilterParams {
    from?: number;
    to?: number;
    key?: string;
    before?: string;
    after?: string;
}

export interface MercuriosStream {
    append(event: MercuriosEvent): Promise<MercuriosEvent>;
    read(seq: number): Promise<MercuriosEvent | undefined>;
    filter(query: FilterParams): Promise<MercuriosEvent[]>;
}
