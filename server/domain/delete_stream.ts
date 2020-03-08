import $streams from "./modules/stream_repository";
import $logger from "../services/logger";

export default async function $deleteStream({
    topic,
}: {
    topic: string;
}): Promise<void> {
    await $streams.delete(topic);

    $logger.info(`stream ${topic} deleted`);
}
