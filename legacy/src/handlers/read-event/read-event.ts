import { MercuriosEvent } from "../../models/event";
import { $store } from "../../store/store";
import { $logger } from "../../utils/logger";

export default async function readEvent(
    topic: string,
    seq: "latest" | number
): Promise<MercuriosEvent | undefined> {
    let event =
        seq === "latest"
            ? await $store.latest(topic)
            : await $store.read(topic, seq);

    $logger.debug({ event }, `fetched event`);

    return event;
}
