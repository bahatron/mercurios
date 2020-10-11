import { $streams } from "../services/streams";
import { EventStore } from "../services/streams/interfaces";
import $error from "../utils/error";

const $store: EventStore = {
    async append({ seq, topic, key, data, published_at }) {
        let stream =
            (await $streams.fetchStream(topic)) ??
            (await $streams.createStream(topic));

        return stream.append({ seq, topic, key, data, published_at });
    },

    async read(topic, seq) {
        let stream = await $streams.fetchStream(topic);
        if (!stream) {
            throw $error.NotFound(`stream not found`, { topic });
        }

        return stream.read(seq);
    },

    async filter(topic, query) {
        let stream = await $streams.fetchStream(topic);

        if (!stream) {
            throw $error.NotFound(`stream not found`, { topic });
        }

        return stream.filter(query);
    },

    async deleteStream(topic) {
        await $streams.deleteStream(topic);
    },

    async streamExists(topic) {
        return Boolean(await $streams.fetchStream(topic));
    },

    async topics(filter) {
        return $streams.list(filter);
    },
};

export default $store;
