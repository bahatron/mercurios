import $json from "../utils/json";
import $validator from "../utils/validator";

export interface MercuriosEvent {
    seq?: number;
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
        seq: $validator.nullableInt(seq) ?? undefined,
        published_at: $validator.isoDate(published_at),
        data: $json.parse(data),
    };
}
