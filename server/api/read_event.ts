import $streams from "../models/stream";
import { MercuriosEvent } from "../models/event";
import $error from "../utils/error";

export default async function (
    topic: string,
    seq: number
): Promise<MercuriosEvent | undefined> {
    let stream = await $streams.fetch(topic);

    if (!stream) {
        throw $error.NotFound(`stream ${topic} not found`);
    }

    return stream.read(seq);
}
