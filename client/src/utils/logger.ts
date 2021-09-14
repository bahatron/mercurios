import { AsyncContext } from "@bahatron/utils/lib/context";
import { Logger } from "@bahatron/utils/lib/logger";

export function createLogger({ id, debug = true }) {
    return Logger({ id, debug });
}

export const $logger = createLogger({
    id: () => `${AsyncContext.get("mercuriosCID")}`,
});
