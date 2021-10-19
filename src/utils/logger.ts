import { Logger } from "@bahatron/utils/lib/logger";

export { Logger };

export function createLogger({ debug = false } = {}) {
    return Logger({
        id: `mercurios:${process.pid}`,
        pretty: process.env.MERCURIOS_DEV === "1",
        debug,
    });
}
