import { $error } from "../utils/error";
import { PostgresDriver } from "./drivers/postgres.driver";
import { StoreDriver } from "./store.interface";

const StoreFactoryMap: Record<
    string,
    (...params: any[]) => Promise<StoreDriver>
> = {
    pg: PostgresDriver,
};

export function StoreFactory({ url, driver = "pg" }): Promise<StoreDriver> {
    return StoreFactoryMap[driver]({ url });
}
