import {
    StoreDriver,
    CreateStoreDriverOptions,
    StoreDriverFactory,
} from "./store.interface";
import { PostgresDriver } from "./drivers/postgres.driver";

const StoreFactoryMap: Record<string, StoreDriverFactory> = {
    pg: PostgresDriver,
};

export function StoreFactory({
    driver = "pg",
    url,
    logger,
}: { driver?: string } & CreateStoreDriverOptions): Promise<StoreDriver> {
    return StoreFactoryMap[driver]({ url, logger });
}
