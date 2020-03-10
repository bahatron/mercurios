import express, { Request, Response, NextFunction } from "express";
import $publishEvent from "../domain/publish_event";
import $readEvent from "../domain/read_event";
import $error from "../services/error";
import $logger from "../services/logger";

const $router = express.Router();

export function asyncRoute(controller: (req: Request, res: Response) => void) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await controller(req, res);
            next();
        } catch (err) {
            next(err);
        }
    };
}

$router.post(
    "/stream/:topic",
    asyncRoute(async (req, res) => {
        return res.status(201).json(
            await $publishEvent({
                topic: req.params.topic,
                ...req.body,
            })
        );
    })
);

$router.get(
    "/stream/:topic/:seq",
    asyncRoute(async (req, res) => {
        let event = await $readEvent(
            req.params.topic,
            parseInt(req.params.seq)
        );

        if (!event) {
            return res.status(204).json();
        }

        return res.status(200).json(event);
    })
);

export default $router;
