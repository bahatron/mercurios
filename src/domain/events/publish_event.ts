import $streams from "../streams/stream_repository";
import { Event } from "./event_factory";

export default async function publishEvent(
    topic: string,
    data?: any
): Promise<Event> {
    let stream = await $streams.fetch(topic);

    let event = await stream.append(data);

    return event;
}
