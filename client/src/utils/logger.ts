import { AsyncContext } from "@bahatron/utils/lib/context";
import { Logger } from "@bahatron/utils/lib/logger";

export function createLogger({ debug = true }) {
    return Logger({
        id: `mercurios:${process.pid}`,
        debug,
    });
}
