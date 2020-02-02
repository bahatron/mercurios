import { ActionTree, GetterTree } from "vuex";
import $axios from "../utils/axios";

const MERCURIOS_URL = process.server
    ? "http://server:3000"
    : "http://localhost:3000";

export const state = () => {
    return {};
};

type MercuriosState = ReturnType<typeof state>;

export const getters: GetterTree<MercuriosState, any> = {
    hello: state => "hello from the store!",
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

    async onMessage(context, message) {
        console.log(`received message \n`, message);
    },
};
