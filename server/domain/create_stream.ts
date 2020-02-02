import $streams from "./modules/stream_repository";
import { Stream } from "./modules/stream";
import $logger from "../services/logger";

export default async function $createStream(
    topic: string,
    schema?: any
): Promise<Stream | null> {
    if (await $streams.exists(topic)) {
        return null;
    }

    let stream = await $streams.create(topic, schema);

    $logger.info(`created stream - ${topic}`);
    
    return stream;
}
