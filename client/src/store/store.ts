import { $error } from "../utils/error";
import { PostgresDriver } from "./drivers/postgres/postgres.driver";
import { StoreDriver } from "./store.interfaces";

const StoreFactoryMap: Record<
    string,
    (...params: any[]) => Promise<StoreDriver>
> = {
    pg: PostgresDriver,
};

export function StoreFactory({ driver = "pg", url }): Promise<StoreDriver> {
    let factory = StoreFactoryMap[driver];

    if (!factory) {
        throw $error.InternalError(
            `Invalid mercurios driver, valid drivers: ${Object.values(
                StoreFactoryMap
            ).join("|")}`,
            { driver }
        );
    }

    let store = StoreFactoryMap[driver]({ url });

    return store;
}
