<template>
    <v-card>
        <v-card-title> Received Events </v-card-title>
        <v-card-text>
            <p v-for="(item, i) in breakdown" :key="i">
                {{ item[0] }} - {{ item[1] }}
            </p>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    name: "event-breakdown",

    computed: {
        breakdown() {
            return Object.entries(
                this.$store.getters["history"] as Record<string, number>
            );
        },
    },
});
</script>