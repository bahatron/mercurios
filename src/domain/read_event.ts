import $streams from "./modules/stream_repository";
import { Event } from "./modules/event_factory";

export default async function readEvent(
    topic: string,
    seq: number
): Promise<Event | undefined> {
    let stream = await $streams.fetch(topic);

    return stream.read(seq);
}
