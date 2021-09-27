import { Exception } from "@bahatron/utils/lib/error";
import { Logger } from "@bahatron/utils/lib/logger";
import { ErrorRequestHandler } from "express";
import { $validator } from "../../utils/validator";

export const errorHandler: (logger: Logger) => ErrorRequestHandler =
    (logger) => (err: Exception, req, res, next) => {
        let code = $validator.optionalInt(err.code) ?? 500;

        if (code >= 500) {
            logger.error(err);
        } else {
            logger.warning(err, "request failed");
        }

        return res
            .status(code)
            .json({ error: err.message, context: err.context ?? err });
    };
