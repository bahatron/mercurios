import express, { Request, Response, NextFunction } from "express";
import $createStream from "../domain/create_stream";
import $publishEvent from "../domain/publish_event";
import $readEvent from "../domain/read_event";
import $error from "../services/error";

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
    "/streams",
    asyncRoute(async (req, res) => {
        const { topic, schema } = req.body;

        if (!topic) {
            throw $error.BadRequest("topic is required");
        }

        const stream = await $createStream(topic, schema);

        if (!stream) {
            return res.status(200).json();
        }

        return res.status(201).json(stream);
    })
);

$router.post(
    "/stream/:topic",
    asyncRoute(async (req, res) => {
        return res
            .status(201)
            .json(await $publishEvent(req.params.topic, req.body));
    })
);

$router.get(
    "/stream/:topic/:seq",
    asyncRoute(async (req, res) => {
        return res
            .status(200)
            .json(await $readEvent(req.params.topic, parseInt(req.params.seq)));
    })
);

export default $router;
