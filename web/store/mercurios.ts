import { ActionTree, GetterTree, MutationTree } from "vuex";
import $axios from "../utils/axios";

const MERCURIOS_URL = process.server
    ? "http://server:3000"
    : `http://localhost:4254`;

export const state = () => {
    return {
        topics: {} as Record<string, { count: number; seq: number }>,
        messages: [] as Record<string, any>[],
    };
};

type MercuriosState = ReturnType<typeof state>;

export const getters: GetterTree<MercuriosState, any> = {
    hello: state => "hello from the store!",
    stats: state => {
        return Object.entries(state.topics).map(([topic, state]) => {
            return { topic, ...state };
        });
    },
};

export const mutations: MutationTree<MercuriosState> = {
    addMessage(state, { message }) {
        let { topic } = message;

        state.topics = {
            ...state.topics,
            [topic]: {
                seq: message.seq,
                count: state.topics[topic] ? state.topics[topic].count + 1 : 1,
            },
        };

        console.log("mercurios state mutated", state);
    },
};

export const actions: ActionTree<MercuriosState, any> = {
    async createStream(this: any, context, { topic }) {
        console.log(`creating stream....`);

        let response = await $axios.post(`${MERCURIOS_URL}/streams`, { topic });

        console.log("created stream...success! \n", response.data);
    },

    async publish(context, { topic, data }) {
        console.log(`publishing to topic`);

        let response = await $axios.post(`${MERCURIOS_URL}/stream/${topic}`, {
            data,
        });

        console.log(`published to topic!\n`, response.data);
    },

    async onClose(context, event) {},
    async onError(context, error) {},
    async onOpen(context, event) {},

    async onMessage({ state, commit }, message: MessageEvent) {
        let payload = JSON.parse(message.data);
        console.log(`received message \n`, payload);

        commit("addMessage", { message: payload });
    },
};
