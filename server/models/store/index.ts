import $event, { MercuriosEvent } from "../event";
import { EventStore, EventStoreFactory } from "./interfaces";
import $config from "../../utils/config";
import $error, { ERROR_CODES } from "../../utils/error";

let driver = require(`./drivers/${$config.store_driver}`).default;

if (!driver) {
    throw $error.InternalError(`no driver found`, {
        driver,
        code: ERROR_CODES.UNEXPECTED_ERROR,
    });
}
const _driver: Promise<EventStore> = driver();

// const $store = new Proxy(
//     {},
//     {
//         get(target, attribute: any) {
//             return async function (...args: any[]) {
//                 let driver: any = await _driver;
//                 return driver[attribute](...args);
//             };
//         },
//     }
// ) as EventStore;

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

    async streamExists(topic: string) {
        return (await _driver).streamExists(topic);
    },
};

export default $store;
