<template>
    <v-container fluid fill-height>
        <v-row>
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
            </v-col>

            <v-col cols="6">
                <h1>stream</h1>
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
                    <v-btn @click="publishEvent">
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
        };
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

    methods: {
        async subscribeToTopic() {
            if (!this.ws) {
                console.warn(`no websocket connection`);
            }

            (this.ws as WebSocket).send(
                JSON.stringify({
                    action: "subscribe",
                    topic: this.SUBSCRIBE_TOPIC.topic,
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

        async publishEvent() {
            let { topic, data } = this.PUBLISH_EVENT;

            await this.$store.dispatch("mercurios/publish", {
                topic,
                data,
            });

            this.PUBLISH_EVENT.visible = false;
        },
    },
});
</script>
