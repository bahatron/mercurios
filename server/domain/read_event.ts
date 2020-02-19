import $streams from "./modules/stream_repository";
import { MercuriosEvent } from "./modules/event";

export default async function $readEvent(
    topic: string,
    seq: number
): Promise<MercuriosEvent | undefined> {
    let stream = await $streams.fetch(topic);

    return stream.read(seq);
}
