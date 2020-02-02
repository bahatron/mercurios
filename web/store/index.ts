import { ActionTree } from "vuex";

export const actions: ActionTree<any, any> = {
    async nuxtServerInit(storeContext, nuxtContext: any) {
        console.log(`nuxt server init\n`);

        if (process.server) {
            console.log(`running on server`);
        }

        if (process.client) {
            console.log(`running on client`);
        }
    },
};
