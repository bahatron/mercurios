import { $streams } from "../services/streams";
import { EventFilters } from "../services/streams/interfaces";
import $error from "../utils/error";
import { MercuriosEvent } from "./event/event";

export const $store = {
    async append({
        seq,
        topic,
        key,
        data,
        published_at,
    }: MercuriosEvent): Promise<MercuriosEvent> {
        let stream =
            (await $streams.fetchStream(topic)) ??
            (await $streams.createStream(topic));

        return stream.append({ seq, topic, key, data, published_at });
    },

    async read(
        topic: string,
        seq: number
    ): Promise<MercuriosEvent | undefined> {
        let stream = await $streams.fetchStream(topic);

        if (!stream) {
            return undefined;
        }

        return stream.read(seq);
    },

    async filter(
        topic: string,
        query: EventFilters
    ): Promise<MercuriosEvent[]> {
        let stream = await $streams.fetchStream(topic);

        if (!stream) {
            throw $error.NotFound(`stream not found`, { topic });
        }

        return stream.filter(query);
    },

    async deleteStream(topic: string) {
        await $streams.deleteStream(topic);
    },

    async streamExists(topic: string) {
        return Boolean(await $streams.fetchStream(topic));
    },

    async topics(params: { like?: string; withEvents: EventFilters }) {
        return $streams.list(params);
    },
};
