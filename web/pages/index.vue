<template>
    <v-container fluid fill-height>
        <v-row fill-height>
            <v-col cols="6" align-items="top">
                <h1>actions</h1>

                <v-div>
                    <v-btn color="primary" @click="CREATE_TOPIC.visible = true">
                        create stream
                    </v-btn>
                </v-div>

                <v-div>
                    <v-btn
                        color="primary"
                        @click="SUBSCRIBE_TOPIC.visible = true"
                    >
                        subscribe to topic
                    </v-btn>
                </v-div>

                <v-div>
                    <v-btn
                        color="primary"
                        @click="PUBLISH_EVENT.visible = true"
                    >
                        publish event
                    </v-btn>
                </v-div>

                <v-div>
                    <v-btn color="accent" @click="clearAutoPublish">
                        clear auto publishes
                    </v-btn>
                </v-div>

                <v-div>
                    <v-dialog
                        v-model="PUBLISH_EVENT_PERIODIC.visible"
                        width="500"
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn color="secondary" v-on="on">
                                automatic publish
                            </v-btn>
                        </template>

                        <v-card class="pa-4">
                            <v-text-field
                                v-model="PUBLISH_EVENT_PERIODIC.topic"
                                type="text"
                                label="topic name"
                            >
                            </v-text-field>

                            <v-text-field
                                v-model="PUBLISH_EVENT_PERIODIC.data"
                                type="text"
                                label="data"
                            >
                            </v-text-field>

                            <v-text-field
                                v-model="PUBLISH_EVENT_PERIODIC.interval"
                                type="text"
                                label="interval (ms)"
                            >
                            </v-text-field>

                            <v-card-actions>
                                <v-btn @click="periodicPublish">
                                    publish
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-div>
            </v-col>

            <v-col cols="6">
                <h1>stream</h1>

                <v-div>
                    <v-list>
                        <v-list-item
                            v-for="message in _messages"
                            :key="message.id"
                        >
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ message }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-div>
            </v-col>
        </v-row>

        <!-- create stream form -->
        <v-dialog v-model="CREATE_TOPIC.visible">
            <v-card class="pa-4">
                <v-text-field
                    v-model="CREATE_TOPIC.topic"
                    type="text"
                    label="topic name"
                >
                </v-text-field>

                <v-card-actions>
                    <v-btn @click="createTopic">
                        create
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--  subscribe to topic form -->
        <v-dialog v-model="SUBSCRIBE_TOPIC.visible">
            <v-card class="pa-4">
                <v-text-field
                    v-model="SUBSCRIBE_TOPIC.topic"
                    type="text"
                    label="topic name"
                >
                </v-text-field>

                <v-card-actions>
                    <v-btn @click="subscribeToTopic">
                        subscribe
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--  publish event form -->
        <v-dialog v-model="PUBLISH_EVENT.visible">
            <v-card class="pa-4">
                <v-text-field
                    v-model="PUBLISH_EVENT.topic"
                    type="text"
                    label="topic name"
                >
                </v-text-field>

                <v-text-field
                    v-model="PUBLISH_EVENT.data"
                    type="text"
                    label="data"
                >
                </v-text-field>

                <v-card-actions>
                    <v-btn @click="singlePublish">
                        publish
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import divider from "../components/divider.vue";

function WsClient() {
    if (!process.client) {
        return null;
    }

    return new WebSocket(`ws://localhost:3000`);
}

export default Vue.extend({
    components: {
        "v-div": divider,
    },
    data() {
        return {
            ws: WsClient(),
            workers: [] as NodeJS.Timeout[],
            CREATE_TOPIC: {
                visible: false,
                topic: "",
            },
            SUBSCRIBE_TOPIC: {
                visible: false,
                topic: "",
            },
            PUBLISH_EVENT: {
                visible: false,
                topic: "",
                data: "",
            },
            PUBLISH_EVENT_PERIODIC: {
                visible: false,
                interval: null,
                topic: "",
                data: "",
            },
        };
    },

    destroyed() {
        if (!this.ws) {
            return;
        }

        (this.ws as WebSocket).close();
    },

    mounted() {
        let ws = this.ws as WebSocket;

        if (ws) {
            ws.onclose = event =>
                this.$store.dispatch(`mercurios/onClose`, event);

            ws.onerror = error =>
                this.$store.dispatch(`mercurios/onError`, error);

            ws.onopen = event =>
                this.$store.dispatch(`mercurios/onOpen`, event);

            ws.onmessage = message =>
                this.$store.dispatch(`mercurios/onMessage`, message);
        }
    },

    computed: {
        _messages() {
            let messages = this.$store.getters["mercurios/messages"];

            return messages;
        },
    },

    methods: {
        async clearAutoPublish() {
            this.workers.forEach(worker => {
                clearTimeout(worker);
            });
        },

        async subscribeToTopic() {
            if (!this.ws) {
                console.warn(`no websocket connection`);
            }

            /** @todo: move this to store, pass ws connection as part of action payload */
            (this.ws as WebSocket).send(
                JSON.stringify({
                    action: "subscribe",
                    options: {
                        topic: this.SUBSCRIBE_TOPIC.topic,
                    },
                })
            );

            this.SUBSCRIBE_TOPIC.visible = false;
        },

        async createTopic() {
            await this.$store.dispatch("mercurios/createStream", {
                topic: this.CREATE_TOPIC.topic,
            });

            this.CREATE_TOPIC.visible = false;
        },

        async publishEvent({ topic, data }: any) {
            await this.$store.dispatch("mercurios/publish", {
                topic,
                data,
            });
        },

        singlePublish() {
            let { topic, data } = this.PUBLISH_EVENT;

            this.publishEvent({ topic, data });

            this.PUBLISH_EVENT.visible = false;
        },

        periodicPublish() {
            let { interval, topic, data } = this.PUBLISH_EVENT_PERIODIC;

            let wat: NodeJS.Timeout;

            console.log(`interval type: ${typeof interval}`, interval);

            if (Boolean(interval) && interval !== null) {
                // let _interval = parseInt((<any>interval) as string);
                let _interval =
                    parseInt((<any>interval) as string) < 100
                        ? 100
                        : parseInt((<any>interval) as string);

                wat = setInterval(() => {
                    this.publishEvent({ topic, data });
                }, _interval);
                this.workers.push(wat);
            }

            this.PUBLISH_EVENT_PERIODIC.visible = false;
        },
    },
});
</script>
