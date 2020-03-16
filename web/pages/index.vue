<template>
    <v-container fluid fill-height>
        <v-row fill-height>
            <v-col cols="6" align-items="top">
                <h1>actions</h1>

                <v-div>
                    <v-dialog v-model="subscribeModal" width="500">
                        <template v-slot:activator="{ on }">
                            <v-btn color="priamry" v-on="on">
                                subscribe
                            </v-btn>
                        </template>

                        <v-card class="pa-4">
                            <v-text-field
                                v-model="topic"
                                type="text"
                                label="topic name"
                            >
                            </v-text-field>
                            <v-card-actions>
                                <v-btn @click="subscribe">
                                    subscribe
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-div>

                <v-div>
                    <v-dialog v-model="publishModal" width="500">
                        <template v-slot:activator="{ on }">
                            <v-btn color="secondary" v-on="on">
                                publish
                            </v-btn>
                        </template>

                        <v-card class="pa-4">
                            <v-text-field
                                v-model="topic"
                                type="text"
                                label="topic name"
                            >
                            </v-text-field>

                            <v-text-field
                                v-model="publishData"
                                type="text"
                                label="data"
                            >
                            </v-text-field>

                            <v-card-actions>
                                <v-btn
                                    @click="
                                        publish({ topic, data: publishData })
                                    "
                                >
                                    publish
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-div>

                <v-div>
                    <v-dialog v-model="automaticPublishModal" width="500">
                        <template v-slot:activator="{ on }">
                            <v-btn color="warning" v-on="on">
                                automatic publish
                            </v-btn>
                        </template>

                        <v-card class="pa-4">
                            <v-text-field
                                v-model="topic"
                                type="text"
                                label="topic name"
                            >
                            </v-text-field>

                            <v-text-field
                                v-model="publishData"
                                type="text"
                                label="data"
                            >
                            </v-text-field>

                            <v-text-field
                                v-model="interval"
                                type="text"
                                label="interval (ms)"
                            >
                            </v-text-field>

                            <v-card-actions>
                                <v-btn @click="automaticPublish">
                                    automatic publish
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-div>

                <v-div>
                    <v-btn color="success" @click="clearAutoPublish">
                        Clear Auto publissh
                    </v-btn>
                </v-div>

                <v-div>
                    <v-dialog v-model="unSubscribeModal" width="500">
                        <template v-slot:activator="{ on }">
                            <v-btn color="info" v-on="on">
                                unsubscribe
                            </v-btn>
                        </template>

                        <v-card class="pa-4">
                            <v-text-field
                                v-model="topic"
                                type="text"
                                label="topic name"
                            >
                            </v-text-field>
                            <v-card-actions>
                                <v-btn @click="unsubscribe">
                                    unsubscribe
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-div>
            </v-col>

            <v-col cols="6">
                <h1>streams</h1>

                <v-div>
                    <v-simple-table>
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-left">topic</th>
                                    <th class="text-left">sequence</th>
                                    <th class="text-left">messages recieved</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in _messages" :key="item.topic">
                                    <td>{{ item.topic }}</td>
                                    <td>{{ item.seq }}</td>
                                    <td>{{ item.count }}</td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import divider from "../components/divider.vue";
// import mercurios, { MercuriosClient } from "../../lib/index";
import mercurios, { MercuriosClient } from "@bahatron/mercurios";

export default Vue.extend({
    components: {
        "v-div": divider,
    },

    data() {
        return {
            ws: mercurios.connect({ url: "http://localhost:4254" }),
            workers: [] as any[],
            publishModal: false,
            subscribeModal: false,
            unSubscribeModal: false,
            automaticPublishModal: false,
            topic: null,
            publishData: null,
            interval: null,
        };
    },

    destroyed() {
        if (!this.ws) {
            return;
        }

        let client: MercuriosClient = this.ws;

        client.close();
    },

    computed: {
        _messages() {
            return this.$store.getters["mercurios/stats"];
        },
    },

    methods: {
        async subscribe() {
            let client: MercuriosClient = this.ws;

            await client.subsribe(this.topic, event => {
                this.$store.commit("mercurios/addMessage", { message: event });
            });

            this.subscribeModal = false;
        },

        async publish({ topic, data }: any) {
            let client: MercuriosClient = this.ws;

            let event = await client.publish(topic, data);

            this.publishModal = false;
        },

        async unsubscribe() {
            let client: MercuriosClient = this.ws;

            client.unsubscribe(this.topic);

            this.unSubscribeModal = false;
        },

        automaticPublish() {
            let interval = this.interval;
            let data = this.publishData;
            let topic = this.topic;

            if (Boolean(interval) && interval !== null) {
                let _interval = parseInt(interval);

                let wat = setInterval(() => {
                    this.publish({ topic, data });
                }, _interval);
                this.workers.push(wat);
            } else {
                alert("no interval");
            }

            this.automaticPublishModal = false;
        },

        clearAutoPublish() {
            this.workers.forEach(worker => {
                clearTimeout(worker);
            });
        },
    },
});
</script>