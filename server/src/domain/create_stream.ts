import $streams from "./modules/stream_repository";
import { Stream } from "./modules/stream";

export default async function createStream(
    topic: string,
    schema?: any
): Promise<Stream | null> {
    if ((await $streams.exists(topic)) === true) {
        return null;
    }

    let stream = await $streams.create(topic, schema);

    return stream;
}
