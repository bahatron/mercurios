import { PostgresStore } from "./drivers/postgres/postgres.store";
import { StoreDriver } from "./store.interfaces";

const StoreFactoryMap = {
    pg: PostgresStore,
};

export function StoreFactory({ driver = "pg", url }): Promise<StoreDriver> {
    let store: Promise<StoreDriver> = StoreFactoryMap[driver]({ url });

    return store;
}
