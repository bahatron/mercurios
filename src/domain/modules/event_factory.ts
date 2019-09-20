import $json from "../../services/json";
import $date from "../../services/date";

export interface Event {
    id: number;
    data: any;
    published_at: string;
    topic: string;
}

export default function eventFactory(
    topic: string,
    id: number,
    published_at: string,
    data: any
): Event {
    return {
        topic,
        id,
        published_at: $date.dateString(published_at),
        data: $json.parse(data),
    };
}
