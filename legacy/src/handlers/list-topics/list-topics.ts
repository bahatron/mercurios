import { EventFilters } from "../../store/store.helpers";
import { $store } from "../../store/store";
import { $logger } from "../../utils/logger";

export default async function listTopics(query: {
    like?: string;
    withEvents?: EventFilters;
    limit?: number;
    offset?: number;
}) {
    let result = await $store.topics(query);

    $logger.debug({ query, result }, "listing topics result");

    return result;
}
