import { CreateLoggerParams, Logger } from "@bahatron/utils/lib/logger";
import httpContext from "express-http-context";
import { CORRELATION_ID } from "../server/middleware/request-id";
import { $config } from "./config";

const getId = () => {
    return `mercurios:server:${httpContext.get(CORRELATION_ID) ?? process.pid}`;
};

export function createLogger(id: CreateLoggerParams["id"] = getId) {
    return Logger({
        debug: $config.debug,
        id,
        pretty: $config.dev_mode,
    });
}

export const $logger: Logger = createLogger();
