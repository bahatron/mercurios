import { Response, Request, NextFunction } from "express";
import { HttpError } from "../../utils/error";
import $logger from "../../utils/logger";

export default function errorHandler(
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    let code = err.httpCode || 500;

    if (code >= 500) {
        $logger.error(err);
    } else {
        $logger.warning(err.message, err);
    }

    return res
        .status(code)
        .json({ message: err.message, context: err.context });
}
