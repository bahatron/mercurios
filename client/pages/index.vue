<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12"> </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <h1>{{ $store.getters["playground/hello"] }}</h1>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    components: {},
};
</script>
