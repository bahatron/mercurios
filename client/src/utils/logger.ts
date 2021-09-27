import { AsyncContext } from "@bahatron/utils/lib/context";
import { Logger } from "@bahatron/utils/lib/logger";

export const REQUEST_ID = "requestId";

export function createLogger({ debug = true }) {
    return Logger({
        id: `mercurios:${AsyncContext.get(REQUEST_ID) ?? process.pid}`,
        debug,
    });
}
