import { CreateLoggerOptions, Logger } from "@bahatron/utils/lib/logger";
import httpContext from "express-http-context";
import { REQUEST_ID } from "../http/middleware/request-id";
import { $config } from "./config";

const getId = () => {
    return `mercurios:server:${httpContext.get(REQUEST_ID) ?? process.pid}`;
};

export function createLogger(id: CreateLoggerOptions["id"] = getId) {
    return Logger({
        debug: $config.debug,
        id,
        pretty: $config.dev_mode,
    });
}

export const $logger: Logger = createLogger();
