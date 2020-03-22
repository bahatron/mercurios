import $streams from "./models/stream";
import { MercuriosEvent } from "./models/event";
import $error from "../services/error";

export default async function $readEvent(
    topic: string,
    seq: number
): Promise<MercuriosEvent | undefined> {
    let stream = await $streams.fetch(topic);

    if (!stream) {
        throw $error.NotFound(`stream ${topic} not found`);
    }
    
    return stream.read(seq);
}
