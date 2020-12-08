<template>
    <v-btn @click="action" color="primary">
        {{ title }}
    </v-btn>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    data() {
        return {};
    },
    props: {
        title: String,
        action: Function,
    },
});
</script>