import $nats from "../services/nats";
import $logger from "../utils/logger";
import moment from "moment";
import { $store } from "../models/store/store";
import $event, { MercuriosEvent } from "../models/event/event";
import { Exception } from "../utils/error";

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
    try {
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
    } catch (err) {
        if ((err as Exception).httpCode === 404) {
            await $store.createStream(topic);
            return publishEvent({ data, key, expectedSeq, topic });
        }

        throw err;
    }
}
