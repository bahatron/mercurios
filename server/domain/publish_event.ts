import $streams from "./modules/stream_repository";
import $nats from "../services/nats";
import $logger from "../services/logger";
import { MercuriosEvent } from "./modules/event";

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
    let stream = await $streams.fetch(topic);

    let event = await stream.append(data, expectedSeq);

    await $nats.publish(`stream.${stream.topic}`, event);

    $logger.info(
        `published event to topic - topic: ${event.topic} seq: ${event.seq}`
    );

    return event;
}
