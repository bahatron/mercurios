import $json from "../../services/json";
import $validator from "../../services/validator";

export interface MercuriosEvent {
    seq: number;
    data: any;
    published_at: string;
    topic: string;
}

export default function $event(
    topic: string,
    seq: number,
    published_at: string,
    data: any
): MercuriosEvent {
    return {
        topic: $validator.string(topic),
        seq: $validator.int(seq),
        published_at: $validator.isoDate(published_at),
        data: $json.parse(data),
    };
}
