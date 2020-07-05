import $nats from "../utils/nats";
import $event from "../models/event";
import moment from "moment";
import $logger from "../utils/logger";

export default async function emitEvent({
    topic,
    data,
}: {
    topic: string;
    data: any;
}) {
    let event = $event({ topic, published_at: moment().toISOString(), data });

    await $nats.publish(`topic.${topic}`, event);

    $logger.debug(`event emitted - topic: ${topic}`);
}
