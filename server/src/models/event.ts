import { $date } from "../utils/date";
import $json from "../utils/json";
import { $validator } from "../utils/validator";

export interface MercuriosEvent {
    seq?: number;
    key?: string;
    data: any;
    published_at: string;
    topic: string;
}

export default function $event({
    topic,
    published_at,
    seq,
    data,
    key,
}: Partial<MercuriosEvent>): MercuriosEvent {
    return {
        topic: $validator.string(topic),
        published_at:
            $validator.optionalIsoDate(published_at) ?? $date.isoString(),
        seq: $validator.optionalInt(seq),
        key: $validator.optionalString(key),
        data: $json.parse(data),
    };
}
