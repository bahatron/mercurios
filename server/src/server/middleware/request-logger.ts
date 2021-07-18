import { RequestHandler } from "express";
import moment from "moment";
import { $logger } from "../../utils/logger";

export const requestLogger: RequestHandler = function (req, res, next) {
    let start = moment();
    $logger.debug(
        `${req.method} ${req.originalUrl} - ${res.statusCode} - request received`
    );

    res.once("finish", () => {
        let time = moment().diff(start, "millisecond", true);

        $logger.info(
            `${req.method} ${req.originalUrl} - ${res.statusCode} - ${time}ms`
        );
    });

    next();
};
