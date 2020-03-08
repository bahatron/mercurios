import { Response, Request, NextFunction } from "express";
import { HttpError } from "../../services/error";
import $logger from "../../services/logger";

export default function errorHandler(
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    let code = err.httpCode || 500;

    $logger.warning(`http server - ${err.message}`, err.context);

    if (code >= 500) {
        $logger.error(err);
    }

    return res.status(code).json(err.httpCode ? err.message : "Internal Error");
}
