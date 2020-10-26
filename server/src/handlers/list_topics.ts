import { $store } from "../models/store";
import { EventFilters } from "../services/streams/interfaces";
import $logger from "../utils/logger";

export default async function listTopics(params: {
    like?: string;
    withEvents: EventFilters;
}) {
    let topics = await $store.topics(params);

    $logger.debug("fetched topics successfully");

    return topics;
}
