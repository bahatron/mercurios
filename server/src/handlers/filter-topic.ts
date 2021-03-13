import { MercuriosEvent } from "../models/event/event";
import { EventFilters } from "../models/store/drivers/helpers";
import { $store } from "../models/store/store";
import { Exception } from "../utils/error";
import $logger from "../utils/logger";

export default async function filterTopic(
    topic: string,
    query: EventFilters = {}
): Promise<MercuriosEvent[]> {
    let result = await $store.filter(topic, query);

    $logger.debug(`topic filtered`, { topic, query, result });

    return result;
}
