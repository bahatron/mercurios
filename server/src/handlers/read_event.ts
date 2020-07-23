import { MercuriosEvent } from "../models/event";
import $store from "../models/store";
import $logger from "../utils/logger";

export default async function readEvent(
    topic: string,
    seq: number
): Promise<MercuriosEvent | null> {
    let event = await $store.fetch(topic, seq);

    $logger.debug(`fetched event - ${topic}`, {
        topic,
        seq,
        found: Boolean(event),
    });

    return event;
}
