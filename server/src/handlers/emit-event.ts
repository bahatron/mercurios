import $nats from "../services/nats";
import $event, { MercuriosEvent } from "../models/event/event";
import $logger from "../utils/logger";

export default async function emitEvent({
    topic,
    data,
    key,
}: Partial<MercuriosEvent>): Promise<MercuriosEvent> {
    let event = $event({
        topic,
        data,
        key,
    });

    await $nats.publish(`mercurios.topic.${topic}`, { event });

    $logger.debug(`event emitted`, event);

    return event;
}
