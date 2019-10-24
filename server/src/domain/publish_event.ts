import $streams from "./modules/stream_repository";
import { Event } from "./modules/event";
import $nats from "../adapters/nats";
import $json from "../services/json";

interface PublishPayload {
    data?: any;
    expectedSeq?: number;
}

export default async function publishEvent(
    topic: string,
    { data, expectedSeq }: PublishPayload = {}
): Promise<Event> {
    let stream = await $streams.fetch(topic);

    let event = await stream.append(data, expectedSeq);

    await $nats.publish(`event_published`, event);

    return event;
}
