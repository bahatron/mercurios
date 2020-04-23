import $streams from "../models/stream";
import $logger from "../utils/logger";

export default async function ({ topic }: { topic: string }): Promise<void> {
    await $streams.delete(topic);

    $logger.debug(`stream ${topic} deleted`);
}
