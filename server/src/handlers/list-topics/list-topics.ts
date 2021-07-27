import { EventFilters } from "../../store/store.helpers";
import { $store } from "../../store/store";
import { $logger } from "../../utils/logger";

export default async function listTopics(params: {
    like?: string;
    withEvents: EventFilters;
}) {
    let topics = await $store.topics(params);

    return topics;
}
