import $nats from "../../services/nats";
import { $logger } from "../../utils/logger";
import { $store } from "../../store/store";
import { MercuriosEvent } from "../../models/event";
import { $json } from "../../utils/json";

export default async function publishEvent({
    data,
    key,
    expectedSeq,
    topic,
}: {
    data?: MercuriosEvent["data"];
    key?: MercuriosEvent["key"];
    expectedSeq?: MercuriosEvent["seq"];
    topic: MercuriosEvent["topic"];
}): Promise<MercuriosEvent> {
    let event = await $store.append(
        MercuriosEvent({
            published_at: new Date().toISOString(),
            seq: expectedSeq,
            key,
            topic,
            data: $json.parse(data),
        })
    );

    $nats.publish(`mercurios.topic.${topic}`, { event }).catch($logger.error);

    return event;
}