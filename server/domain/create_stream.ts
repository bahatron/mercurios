import $streams from "./modules/stream_repository";
import { Stream } from "./modules/stream";
import $logger from "../services/logger";
import $error from "../services/error";

export default async function $createStream(
    topic: string,
    schema?: any
): Promise<Stream | null> {
    if (await $streams.exists(topic)) {
        // throw $error.Conflict(`stream ${topic} already exists`);
        return null;
    }

    let stream = await $streams.create(topic, schema);

    $logger.info(`created stream - ${topic}`);

    return stream;
}
