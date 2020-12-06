import { MercuriosEvent } from "../models/event/event";
import { EventFilters } from "../models/store/drivers/helpers";
import { $store } from "../models/store/store";
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
