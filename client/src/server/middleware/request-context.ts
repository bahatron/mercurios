import { RunInContext } from "@bahatron/utils/lib/context";
import { Logger } from "@bahatron/utils/lib/logger";
import { randomUUID } from "crypto";
import { RequestHandler } from "express";
import { REQUEST_ID } from "../../utils/logger";

export const setRequestContext: (logger: Logger) => RequestHandler =
    (logger) => (req, nes, next) => {
        RunInContext(
            () => {
                logger.debug(`request id set`);
                return next();
            },
            {
                [REQUEST_ID]:
                    req.headers["x-request-id"]?.toString() || randomUUID(),
            }
        );
    };
