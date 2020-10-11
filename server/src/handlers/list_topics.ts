import $store from "../models/store";
import $logger from "../utils/logger";

export default async function listTopics(filter?: string) {
    let topics = await $store.topics(filter);

    $logger.debug("fetched topics successfully");

    return topics;
}
