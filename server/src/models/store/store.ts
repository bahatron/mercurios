import $error from "../../utils/error";
import { MercuriosEvent } from "../event/event";
import { EventFilters } from "./drivers/helpers";
import pgDriver from "./drivers/postgres.driver";
import mysqlDriver from "./drivers/mysql.driver";
import { $config } from "../../utils/config";

export interface StoreDriver {
    // run migrations for sql dbs
    setup(): Promise<void>;
    // these seem to be methods of a "Stream"
    append(event: MercuriosEvent): Promise<MercuriosEvent>;
    read(topic: string, seq: number): Promise<MercuriosEvent | undefined>;
    filter(topic: string, query: EventFilters): Promise<MercuriosEvent[]>;
    // stream repository?
    createStream(topic: string): Promise<void>;
    deleteStream(topic: string): Promise<void>;
    streamExists(topic: string): Promise<boolean>;
    topics(params: {
        like?: string;
        withEvents: EventFilters;
    }): Promise<string[]>;
}

let driver: StoreDriver;
switch ($config.mercurios_store_driver) {
    case "pg":
        driver = pgDriver();
        break;
    case "mysql":
        driver = mysqlDriver();
        break;
    default:
        throw $error.InternalError("invalid mercurios store driver");
}

export const $store = driver;
