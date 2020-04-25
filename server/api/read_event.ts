import { MercuriosEvent } from "../models/event";
import $store from "../models/store";

export default async function (
    topic: string,
    seq: number
): Promise<MercuriosEvent | null> {
    return $store.fetch(topic, seq);
}
