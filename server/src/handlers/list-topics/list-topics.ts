import { EventFilters } from "../../store/store.helpers";
import { $store } from "../../store/store";
import { $logger } from "../../utils/logger";

export default async function listTopics(params: {
    like?: string;
    withEvents: EventFilters;
    limit?: number;
    offset?: number;
}) {
    $logger.debug(params, "listing topics...");

    let topics = await $store.topics(params);

    return topics;
}
