import { MercuriosEvent } from "../event";

export interface EventStoreFactory {
    (): Promise<EventStore>;
}

export interface CreateParams {
    topic: MercuriosEvent["topic"];
    expectedSeq?: MercuriosEvent["seq"];
    published_at: MercuriosEvent["published_at"];
    data: MercuriosEvent["data"];
}

export interface EventStore {
    add(data: CreateParams): Promise<MercuriosEvent>;
    fetch(topic: string, seq: number): Promise<MercuriosEvent>;
    deleteStream(topic: string): Promise<void>;
}
