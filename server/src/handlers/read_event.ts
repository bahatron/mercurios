import { MercuriosEvent } from "../models/event";
import $store from "../models/store";
import $logger from "../utils/logger";

export default async function readEvent(
    topic: string,
    seq: number
): Promise<MercuriosEvent | null> {
    let event = await $store.read(topic, seq);

    $logger.debug(
        {
            topic,
            seq,
            found: Boolean(event),
        },
        `fetched event - ${topic}`
    );

    return event;
}
