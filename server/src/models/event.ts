import $json from "../utils/json";
import { $validator } from "../utils/validator";

export interface MercuriosEvent {
    seq?: number;
    key?: string;
    data: any;
    published_at: string;
    topic: string;
}

export function MercuriosEvent({
    topic,
    published_at,
    seq,
    data,
    key,
}: Partial<MercuriosEvent>): MercuriosEvent {
    return {
        topic: $validator.string(topic),
        published_at:
            $validator.optionalIsoDate(published_at) ??
            new Date().toISOString(),
        seq: $validator.optionalInt(seq),
        key: $validator.optionalString(key),
        data: $json.parse(data),
    };
}
