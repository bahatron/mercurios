import $nats from "../services/nats";
import $event, { MercuriosEvent } from "../models/event";
import $logger from "../utils/logger";
import $validator from "../utils/validator";
import { $date } from "../utils/date";

export default async function emitEvent({
    topic,
    data,
}: {
    topic: string;
    data: any;
}): Promise<MercuriosEvent> {
    let event = $event({
        topic,
        data,
    });

    await $nats.publish(`topic.${topic}`, { event });

    $logger.debug(`event emitted - topic: ${topic}`);

    return event;
}
