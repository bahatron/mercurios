import { ActionTree, GetterTree, MutationTree } from "vuex";

export const state = () => {
    return {
        topics: {} as Record<string, { count: number; seq: number }>,
        messages: [] as Record<string, any>[],
    };
};

type MercuriosState = ReturnType<typeof state>;

export const getters: GetterTree<MercuriosState, any> = {
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
    },
};
