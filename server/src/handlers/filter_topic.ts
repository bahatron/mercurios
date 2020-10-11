import { FilterParams } from "../services/streams/interfaces";
import { MercuriosEvent } from "../models/event";
import $store from "../models/store";
import $logger from "../utils/logger";
import { Exception } from "../utils/error";

export default async function filterTopic(
    topic: string,
    query: FilterParams = {}
): Promise<MercuriosEvent[]> {
    return await $store.filter(topic, query).catch((err: Exception) => {
        if (err.httpCode === 404) {
            return [];
        }

        throw err;
    });
}
