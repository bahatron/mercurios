import $nats from "../services/nats";
import $json from "../services/json";
import $event from "./models/event";
import moment from "moment";

export default async function $emitEvent({
    topic,
    data,
}: {
    topic: string;
    data: any;
}) {
    await $nats.publish(
        `topic.${topic}`,
        $event({ topic, published_at: moment().toISOString(), data })
    );
}
