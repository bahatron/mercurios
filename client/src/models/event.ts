import { pickBy } from "lodash";
import { $validator } from "../utils/validator";
import { MercuriosEventSchema } from "./event.schema";

export interface MercuriosEvent {
    topic: string;
    seq: number;
    timestamp: string;
    key?: string;
    data?: any;
}

export function MercuriosEvent({
    topic,
    timestamp = new Date().toISOString(),
    seq,
    data,
    key,
}: Partial<MercuriosEvent> = {}): MercuriosEvent {
    // this is because undefine's are returned as null by mysql/postgres
    let event: any = pickBy(
        {
            topic,
            timestamp,
            seq,
            data: JSON.parse(data),
            key,
        },
        Boolean
    );

    $validator.json(event, MercuriosEventSchema);

    return event;
}
