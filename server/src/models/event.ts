import $json from "../utils/json";
import $validator from "../utils/validator";

export interface MercuriosEvent {
    seq: number | null;
    key: string | null;
    data: any;
    published_at: string;
    topic: string;
}

export default function $event({
    topic,
    published_at,
    seq = null,
    data = null,
    key = null,
}: Partial<MercuriosEvent>): MercuriosEvent {
    return {
        topic: $validator.string(topic),
        published_at: $validator.isoDate(published_at),
        seq: $validator.optionalInt(seq),
        key: $validator.optionalString(key),
        data: $json.parse(data),
    };
}
