import { RequestHandler } from "express";
import httpContext from "express-http-context";
import { v4 } from "uuid";
import $logger from "../../utils/logger";

export const CORRELATION_ID = "correlationId";

export const requestId: RequestHandler = async (req, res, next) => {
    try {
        let id = req.header("x-request-id") ?? v4();

        httpContext.set(CORRELATION_ID, id);
    } catch (error) {
        $logger.error(error, "error while setting http context in middleware");
    } finally {
        return next();
    }
};
