import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

export default new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/",
            name: "playground",
            component: () =>
                import(
                    /* webpackChunkName: "playground" */
                    "./pages/playground.vue"
                ),
        },
    ],
});
