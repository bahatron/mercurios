import $nats from "../services/nats";
import $logger from "../utils/logger";
import moment from "moment";
import { $store } from "../models/store";
import $event, { MercuriosEvent } from "../models/event/event";

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
        $event({
            published_at: moment().toISOString(),
            seq: expectedSeq,
            key: key,
            topic,
            data,
        })
    );

    await $nats.publish(`mercurios.topic.${topic}`, { event });

    $logger.debug(`event published`, {
        key,
        expectedSeq,
        seq: event.seq,
        topic,
    });

    return event;
}
