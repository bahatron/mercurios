import $nats from "../services/nats";
import $event from "./models/event";
import moment from "moment";
import $logger from "../services/logger";

export default async function ({ topic, data }: { topic: string; data: any }) {
    await $nats.publish(
        `topic.${topic}`,
        $event({ topic, published_at: moment().toISOString(), data })
    );
    $logger.debug(`event emitted - topic: ${topic}`);
}
