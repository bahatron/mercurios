import express, { Request, Response, NextFunction } from "express";
import $createStream from "../domain/create_stream";
import $publishEvent from "../domain/publish_event";
import $readEvent from "../domain/read_event";
import $error from "../services/error";

const $router = express.Router();

export const ROUTES = Object.freeze({
    STREAM_COLLECTION: "/streams",
    STREAM: "/stream/:topic",
    EVENT: "/stream/:topic/:seq",
});

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
    ROUTES.STREAM_COLLECTION,
    asyncRoute(async (req, res) => {
        const { topic, schema } = req.body;

        if (!topic) {
            throw $error.Error("topic is required", 400);
        }

        const stream = await $createStream(topic, schema);

        if (!stream) {
            return res.status(200).json();
        }

        return res.status(201).json(stream);
    })
);
$router.post(
    ROUTES.STREAM,
    asyncRoute(async (req, res) => {
        let event = await $publishEvent(req.params.topic, req.body);

        return res.status(201).json(event);
    })
);

$router.get(
    ROUTES.EVENT,
    asyncRoute(async (req, res) => {
        let event = await $readEvent(
            req.params.topic,
            parseInt(req.params.seq)
        );

        return res.status(200).json(event);
    })
);

export default $router;
