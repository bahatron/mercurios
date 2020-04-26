import $nats from "../utils/nats";
import $logger from "../utils/logger";
import $event, { MercuriosEvent } from "../models/event";
import moment from "moment";
import $store from "../services/store";
import $validator from "../utils/validator";

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
    let event = await $store.add({
        published_at: moment().toISOString(),
        expectedSeq,
        topic,
        data,
    });

    $logger.debug(`event persisted - topic: ${topic} - seq: ${event.seq}`);

    await $nats.publish(`topic.${topic}`, event);

    $logger.debug(`event published - topic: ${event.topic}`);

    return event;
}
