import { Exception } from "@bahatron/utils/lib/error";
import { Response, Request, NextFunction } from "express";
import { $logger } from "../../utils/logger";

export default function errorHandler(
    err: Exception,
    req: Request,
    res: Response,
    next: NextFunction
) {
    let code = err.code || 500;

    if (code >= 500) {
        $logger.error(err);
    } else {
        $logger.debug(err);
    }

    return res
        .status(code)
        .json({ message: err.message, context: err.context });
}
