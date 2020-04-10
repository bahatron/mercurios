import { Request, Response, NextFunction } from "express";

export default function asyncRoute(
    habdler: (req: Request, res: Response) => void
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await habdler(req, res);
        } catch (err) {
            next(err);
        }
    };
}
