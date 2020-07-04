import $nats from "../utils/nats";
import $logger from "../utils/logger";
import $event, { MercuriosEvent } from "../models/event";
import moment from "moment";
import $validator from "../utils/validator";
import $store from "../models/store";

interface PublishPayload {
    data?: any;
    expectedSeq?: number;
    topic: string;
}

export default async function publishEvent({
    data,
    expectedSeq,
    topic,
}: PublishPayload): Promise<MercuriosEvent> {
    let event = await $store.add({
        published_at: moment().toISOString(),
        expectedSeq,
        topic,
        data,
    });

    await $nats.publish(`topic.${topic}`, event);

    $logger.debug(
        `event published - topic: ${event.topic} - seq: ${event.seq}`
    );

    return event;
}
