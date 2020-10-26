import { MercuriosEvent } from "../../models/event";

/** @todo: time filtering */
export interface EventFilters {
    from?: number;
    to?: number;
    key?: string;
    before?: string;
    after?: string;
}

export interface MercuriosStream {
    append(event: MercuriosEvent): Promise<MercuriosEvent>;
    read(seq: number): Promise<MercuriosEvent | undefined>;
    filter(query: EventFilters): Promise<MercuriosEvent[]>;
}
