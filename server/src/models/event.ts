import { pickBy } from "lodash";
import { $json } from "../utils/json";
import { $validator } from "../utils/validator";
import { MercuriosEventSchema } from "./event.schema";

export interface MercuriosEvent {
    seq?: number;
    key: string | null;
    data: any;
    published_at: string;
    topic: string;
}

export function MercuriosEvent({
    topic,
    published_at = new Date().toISOString(),
    seq,
    data,
    key,
}: Partial<MercuriosEvent> = {}): MercuriosEvent {
    let event: any = pickBy(
        {
            topic,
            published_at,
            seq,
            data: $json.parse(data),
            key,
        },
        (val) => val !== null
    );

    $validator.schema(event, MercuriosEventSchema);

    return event;
}
