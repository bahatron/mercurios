import $streams from "../models/stream";
import $nats from "../utils/nats";
import $logger from "../utils/logger";
import { MercuriosEvent } from "../models/event";

interface PublishPayload {
    data?: any;
    expectedSeq?: number;
    topic: string;
}

export default async function ({
    data,
    expectedSeq,
    topic,
}: PublishPayload): Promise<MercuriosEvent> {
    let stream =
        (await $streams.fetch(topic)) ?? (await $streams.create(topic));

    let event = await stream.append(data, expectedSeq);
    $logger.debug(`event persisted - topic: ${topic} - seq: ${event.seq}`);

    await $nats.publish(`topic.${stream.topic}`, event);
    $logger.debug(`event published - topic: ${event.topic}`);

    return event;
}
