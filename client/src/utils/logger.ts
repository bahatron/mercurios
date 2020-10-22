import { createLogger } from "@bahatron/logger";

export const $logger = createLogger({
    debug: process.env.MERCURIOS_DEBUG === "1",
    id: "[mercurios client]",
    colours: process.env.MERCURIOS_ENV !== "production",
});
