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

/**
 * This only works because the driver only provides functions without any sort of chaining
 */
const $store = new Proxy(
    {},
    {
        get(target, attribute: any) {
            return async function (...args: any[]) {
                let driver: any = await _driver;
                return driver[attribute](...args);
            };
        },
    }
) as EventStore;

export default $store;
