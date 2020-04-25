import $nats from "../utils/nats";
import $logger from "../utils/logger";
import $event, { MercuriosEvent } from "../models/event";
import moment from "moment";
import $store from "../models/store";

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
    /** @todo find a more elegant way than recreating or remapping the object */
    let event = await $store.add(
        $event({ topic, published_at: moment().toISOString(), data }),
        expectedSeq
    );

    $logger.debug(`event persisted - topic: ${topic} - seq: ${event.seq}`);

    await $nats.publish(`topic.${topic}`, event);

    $logger.debug(`event published - topic: ${event.topic}`);

    return event;
}
