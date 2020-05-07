import { MercuriosEvent } from "../models/event";
import $store from "../models/store";
import $logger from "../utils/logger";

export default async function (
    topic: string,
    seq: number
): Promise<MercuriosEvent | null> {
    let event = await $store.fetch(topic, seq);

    $logger.debug(`fetched event`, event);

    return event;
}
