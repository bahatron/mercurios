import { MercuriosEvent } from "../models/event/event";
import { $store } from "../models/store/store";
import $logger from "../utils/logger";

export default async function readEvent(
    topic: string,
    seq: number
): Promise<MercuriosEvent | undefined> {
    let event = await $store.read(topic, seq);

    $logger.debug(`fetched event - ${topic}`, {
        topic,
        seq,
        found: Boolean(event),
    });

    return event;
}
