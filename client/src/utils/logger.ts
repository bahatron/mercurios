import { AsyncContext } from "@bahatron/utils/lib/context";
import { Logger } from "@bahatron/utils/lib/logger";

export function createLogger({ id, debug = true, pretty = false }) {
    return Logger({
        id,
        debug,
        pretty,
    });
}

export const $logger = createLogger({
    id: () => `mercurios:${AsyncContext.get("mercuriosCID") ?? process.pid}`,
    debug: process.env.MERCURIOS_DEBUG === "1",
    pretty: process.env.MERCURIOS_DEV === "1",
});
