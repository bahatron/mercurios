<template>
    <v-expansion-panels>
        <v-expansion-panel v-for="(event, i) in events" :key="i">
            <v-expansion-panel-header>
                <h4>{{ event.published_at }} - {{ event.topic }}</h4>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                <p>topic: {{ event.topic }}</p>
                <p>seq: {{ event.seq }}</p>
                <p>key: {{ event.key }}</p>
                <p>data: {{ event.data }}</p>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: "event-list",
    computed: {
        events() {
            return this.$store.getters["latestEvents"];
        },
    },
});
</script>