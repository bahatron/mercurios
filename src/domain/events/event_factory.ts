import $json from "../../services/json";
import $date from "../../services/date";

export interface Event {
    seq: number;
    data: any;
    published_at: string;
    topic: string;
}

export default function eventFactory(
    topic: string,
    seq: number,
    published_at: string,
    data: any
): Event {
    return {
        topic,
        seq,
        published_at: $date.dateString(published_at),
        data: $json.parse(data) // @todo: reduce amount of parsing/stringify calls
    };
}
