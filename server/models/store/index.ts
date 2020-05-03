import $event, { MercuriosEvent } from "../event";
import mysql from "./drivers/mysql";
import { EventStore } from "./interfaces";

const _driver = mysql();

const $store: EventStore = {
    async add(params) {
        return (await _driver).add(params);
    },

    async fetch(topic: string, seq: number) {
        return (await _driver).fetch(topic, seq);
    },

    async deleteStream(topic: string) {
        return (await _driver).deleteStream(topic);
    },
};

export default $store;
