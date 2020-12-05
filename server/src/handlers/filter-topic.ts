import { EventFilters } from "../services/streams/interfaces";
import { MercuriosEvent } from "../models/event/event";
import { $store } from "../models/store";
import { Exception } from "../utils/error";

export default async function filterTopic(
    topic: string,
    query: EventFilters = {}
): Promise<MercuriosEvent[]> {
    return await $store.filter(topic, query).catch((err: Exception) => {
        if (err.httpCode === 404) {
            return [];
        }

        throw err;
    });
}
