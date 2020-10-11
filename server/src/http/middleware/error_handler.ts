import { Response, Request, NextFunction } from "express";
import $logger from "../../utils/logger";
import { Exception } from "../../utils/error";

export default function errorHandler(
    err: Exception,
    req: Request,
    res: Response,
    next: NextFunction
) {
    let code = err.httpCode || 500;

    if (code >= 500) {
        $logger.error(err);
    }

    return res.status(code).json({ message: err.message, ...err.context });
}
