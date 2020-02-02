import { ActionTree, GetterTree, MutationTree } from "vuex";
import $axios from "../utils/axios";

const MERCURIOS_URL = process.server
    ? "http://server:3000"
    : "http://localhost:3000";

export const state = () => {
    return {
        messages: {} as Record<string, number>,
    };
};

type MercuriosState = ReturnType<typeof state>;

export const getters: GetterTree<MercuriosState, any> = {
    hello: state => "hello from the store!",
    messages: state =>
        Object.entries(state.messages).map(([key, value]) => {
            return {
                [key]: value,
            };
        }),
};

export const mutations: MutationTree<MercuriosState> = {
    addMessage(state, { message }) {
        let { topic } = message;

        state.messages = {
            ...state.messages,
            [topic]: (state.messages[topic] || 0) + 1,
        };

        console.log("mercurios state mutated", state);
    },
};

export const actions: ActionTree<MercuriosState, any> = {
    async createStream(this: any, context, { topic }) {
        console.log(`creating stream....`);

        // let response = await this.$axios.$post(MERCURIOS_URL, { topic });
        let response = await $axios.post(`${MERCURIOS_URL}/streams`, { topic });

        console.log("got data! \n", response.data);
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
