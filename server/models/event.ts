import $json from "../utils/json";
import $validator from "../utils/validator";

export interface MercuriosEvent {
    seq?: number | null;
    data: any;
    published_at: string;
    topic: string;
}

export default function $event({
    topic,
    seq,
    published_at,
    data,
}: MercuriosEvent): MercuriosEvent {
    return {
        topic: $validator.string(topic),
        seq: $validator.nullableInt(seq),
        published_at: $validator.isoDate(published_at),
        data: $json.parse(data),
    };
}
