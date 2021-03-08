
<template>
    <v-container fluid>
        <v-row no-gutters>
            <v-col cols="6" class="pa-2">
                <action-card
                    v-for="(item, i) in actions"
                    :key="i"
                    :title="item.title"
                    :action="item.action"
                >
                </action-card>
            </v-col>
            <v-col cols="6" class="pa-2">
                <event-breakdown class="mb-4" />

                <event-list />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import Vue from "vue";
import EventList from "../components/event-list.vue";
import ActionCard from "../components/action-card.vue";
import mercurios from "../services/mercurios";
import EventBreakdown from "../components/event-breakdown.vue";

export default Vue.extend({
    components: {
        EventList,
        ActionCard,
        EventBreakdown,
    },
    data() {
        setInterval(async () => {
            await mercurios.publish("heartbeat");
        }, 1000);

        mercurios.subscribe(">", async (msg) => {
            this.$store.dispatch("storeEvent", msg.event);
        });

        return {
            actions: [
                {
                    title: "Publish Event",
                    action: () => alert("Work in Progress!"),
                },
            ],
        };
    },
});
</script>