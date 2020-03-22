import $streams from "./models/stream";
import $nats from "../services/nats";
import $logger from "../services/logger";
import { MercuriosEvent } from "./models/event";

interface PublishPayload {
    data?: any;
    expectedSeq?: number;
    topic: string;
}

export default async function $publishEvent({
    data,
    expectedSeq,
    topic,
}: PublishPayload): Promise<MercuriosEvent> {
    let stream =
        (await $streams.fetch(topic)) ?? (await $streams.create(topic));

    let event = await stream.append(data, expectedSeq);

    await $nats.publish(`topic.${stream.topic}`, event);

    $logger.info(
        `published event to stream - topic: ${event.topic} seq: ${event.seq}`
    );

    return event;
}
