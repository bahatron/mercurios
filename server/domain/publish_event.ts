import $streams from "./modules/stream_repository";
import { Event } from "./modules/event";
import $nats from "../services/nats";
import $logger from "../services/logger";
import $json from "../services/json";

interface PublishPayload {
    data?: any;
    expectedSeq?: number;
    topic: string;
}

export default async function $publishEvent({
    data,
    expectedSeq,
    topic,
}: PublishPayload): Promise<Event> {
    let stream = await $streams.fetch(topic);

    let event = await stream.append(data, expectedSeq);

    await $nats.publish(`event_published`, event);

    $logger.info(
        `published event to topic - topic: ${event.topic} seq: ${event.seq}`
    );

    return event;
}
