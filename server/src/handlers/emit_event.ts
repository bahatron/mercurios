import $nats from "../services/nats";
import $event, { MercuriosEvent } from "../models/event";
import moment from "moment";
import $logger from "../utils/logger";

export default async function emitEvent({
    topic,
    data,
}: {
    topic: string;
    data: any;
}): Promise<MercuriosEvent> {
    let event = $event({ topic, published_at: moment().toISOString(), data });

    await $nats.publish(`topic.${topic}`, { event });

    $logger.debug(`event emitted - topic: ${topic}`);

    return event;
}
