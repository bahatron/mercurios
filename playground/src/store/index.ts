import Vuex from "vuex";
import Vue from "vue";
import { MercuriosEvent } from "@bahatron/mercurios";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {},
    state: {
        events: [] as any[],
        history: {} as Record<string, number>,
    },

    actions: {
        async storeEvent({ state }, payload: MercuriosEvent) {
            Vue.set(
                state.history,
                payload.topic,
                state.history[payload.topic] + 1 || 1
            );

            while (state.events.length >= 10) {
                state.events.pop();
            }

            state.events.unshift(payload);
        },
    },

    getters: {
        latestEvents: state => state.events,
        history: state => state.history,
    },
});
