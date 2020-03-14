import { Response, Request, NextFunction } from "express";
import { HttpError } from "../../services/error";
import $logger from "../../services/logger";
import $config from "../../services/config";

export default function errorHandler(
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    let code = err.httpCode || 500;

    $logger.debug(`http server - ${err.message}`, err.context);

    if (code >= 500) {
        $logger.error(err);
    }

    return res.status(code).json($config.dev_mode ? err : err.message);
}
