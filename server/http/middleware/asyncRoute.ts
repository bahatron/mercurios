import { Request, Response, NextFunction } from "express";

export default (controller: (req: Request, res: Response) => void) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await controller(req, res);
            next();
        } catch (err) {
            next(err);
        }
    };
};
