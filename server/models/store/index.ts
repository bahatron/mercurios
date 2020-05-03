import $event, { MercuriosEvent } from "../event";
import { EventStore, EventStoreFactory } from "./interfaces";
import $config from "../../utils/config";
import $error from "../../utils/error";

const _driver: Promise<EventStore> = require(`./drivers/${$config.store_driver}`).default();

const $store: EventStore = {
    async add(params) {
        return (await _driver).add(params);
    },

    async fetch(topic: string, seq: number) {
        if (!seq) {
            throw $error.BadRequest(`seq is mandatory`);
        }

        return (await _driver).fetch(topic, seq);
    },

    async deleteStream(topic: string) {
        return (await _driver).deleteStream(topic);
    },
};

export default $store;
