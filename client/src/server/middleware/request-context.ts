import { RunInContext } from "@bahatron/utils/lib/context";
import { Logger } from "@bahatron/utils/lib/logger";
import { randomUUID } from "crypto";
import { RequestHandler } from "express";

export const REQUEST_ID = "requestId";

export const setRequestContext: (logger: Logger) => RequestHandler =
    (logger) => (req, nes, next) => {
        RunInContext(() => next(), {
            [REQUEST_ID]:
                req.headers["x-request-id"]?.toString() || randomUUID(),
        });
    };
