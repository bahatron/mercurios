import { omit, omitBy, pickBy, values } from "lodash";
import { $validator } from "../utils/validator";
import { MercuriosEventSchema } from "./event.schema";

export interface MercuriosEvent {
    seq?: number;
    key: string | null;
    data: any;
    published_at: string;
    topic: string;
}

// export function MercuriosEvent({
//     topic,
//     published_at,
//     seq,
//     data,
//     key,
// }: Partial<MercuriosEvent>): MercuriosEvent {
//     return {
//         topic: $validator.string(topic),
//         published_at: $validator.string(published_at),
//         seq: $validator.optionalInt(seq),
//         key: $validator.optionalString(key),
//         data: $json.parse(data),
//     };
// }

export function MercuriosEvent({
    topic,
    published_at = new Date().toISOString(),
    seq,
    data,
    key,
}: Partial<MercuriosEvent> = {}): MercuriosEvent {
    let event: any = {
        topic,
        published_at,
        seq,
        data,
        key,
    };

    $validator.schema(event, MercuriosEventSchema);

    return event;
}
