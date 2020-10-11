import $nats from "../services/nats";
import $logger from "../utils/logger";
import moment from "moment";
import $store from "../models/store";
import $event, { MercuriosEvent } from "../models/event";

interface PublishPayload {
    data?: any;
    key?: string;
    expectedSeq?: number;
    topic: string;
}

export default async function publishEvent({
    data,
    key,
    expectedSeq,
    topic,
}: PublishPayload): Promise<MercuriosEvent> {
    let event = await $store.append(
        $event({
            published_at: moment().toISOString(),
            seq: expectedSeq ?? null,
            key: key ?? null,
            topic,
            data,
        })
    );

    await $nats.publish(`topic.${topic}`, { event });

    $logger.debug(
        {
            topic: event.topic,
            key: event.key,
            seq: event.seq,
            published_at: event.published_at,
        },
        `event published`
    );

    return event;
}
