import { EventFilters } from "../models/store/drivers/helpers";
import { $store } from "../models/store/store";
import $logger from "../utils/logger";

export default async function listTopics(params: {
    like?: string;
    withEvents: EventFilters;
}) {
    let topics = await $store.topics(params);

    $logger.debug("fetched topics", { params });

    return topics;
}
