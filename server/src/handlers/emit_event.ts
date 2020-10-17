import $nats from "../services/nats";
import $event, { MercuriosEvent } from "../models/event";
import $logger from "../utils/logger";
import $validator from "../utils/validator";
import { $date } from "../utils/date";

export default async function emitEvent({
    topic,
    data,
    published_at,
    key,
}: {
    topic: string;
    data: any;
    published_at?: string;
    key?: string;
}): Promise<MercuriosEvent> {
    let event = $event({
        topic,
        published_at: $validator.isIsoDate(published_at)
            ? published_at
            : $date.isoString(),
        data,
        key,
    });

    await $nats.publish(`topic.${topic}`, { event });

    $logger.debug(`event emitted - topic: ${topic}`);

    return event;
}
