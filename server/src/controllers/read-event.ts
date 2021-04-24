import { MercuriosEvent } from "../models/event/event";
import { $store } from "../models/store/store";
import $logger from "../utils/logger";

export default async function readEvent(
    topic: string,
    seq: "latest" | number
): Promise<MercuriosEvent | undefined> {
    if (seq === "latest") {
        let result = await $store.latest(topic);

        if (!result) {
            return undefined;
        }
        seq = result;
    }

    let event = await $store.read(topic, seq);

    $logger.debug({ event }, `fetched event`);

    return event;
}
