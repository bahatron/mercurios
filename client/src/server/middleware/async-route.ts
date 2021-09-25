import { Request, Response, RequestHandler } from "express";

export function asyncRoute(
    controller: (req: Request, res: Response) => void
): RequestHandler {
    return async function (req, res, next) {
        try {
            await controller(req, res);
        } catch (err) {
            next(err);
        }
    };
}
