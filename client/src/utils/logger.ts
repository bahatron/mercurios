import { Logger } from "@bahatron/utils/lib/logger";

export function createLogger({ id, debug = true }) {
    return Logger({ id, debug });
}
