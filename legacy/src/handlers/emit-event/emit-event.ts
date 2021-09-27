import $nats from "../../services/nats";
import { MercuriosEvent } from "../../models/event";
import { $logger } from "../../utils/logger";

export default async function emitEvent({
    topic,
    data,
    key,
}: Partial<MercuriosEvent>): Promise<MercuriosEvent> {
    let event = MercuriosEvent({
        topic,
        data,
        key,
    });

    await $nats.publish(`mercurios.topic.${topic}`, { event });

    $logger.debug({ event }, `event emitted`);

    return event;
}
