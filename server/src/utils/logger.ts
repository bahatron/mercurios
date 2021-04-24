import { Logger } from "@bahatron/utils";
import httpContext from "express-http-context";
import { CORRELATION_ID } from "../server/middleware/request-id";
import { $config } from "./config";

export const LOGGER_ID = `mercurios:server:${process.pid}`;

const getId = () => {
    let id = httpContext.get(CORRELATION_ID) ?? LOGGER_ID;

    // console.log({
    //     correlationId: httpContext.get(CORRELATION_ID),
    //     loggerId: LOGGER_ID,
    //     id,
    // });

    return id;
};
export const $logger: Logger.Logger = Logger.Logger({
    debug: $config.debug,
    id: getId,
    pretty: $config.dev_mode,
    formatter: JSON.stringify,
});

export default $logger;
