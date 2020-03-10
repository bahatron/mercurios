import $streams from "./modules/stream_repository";
import { MercuriosEvent } from "./modules/event";
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
