import express, { Request, Response, RequestHandler } from "express";
import publish_event from "../api/publish_event";
import emit_event from "../api/emit_event";
import read_event from "../api/read_event";
import $logger from "../utils/logger";

function asyncRoute(
    handler: (req: Request, res: Response) => void
): RequestHandler {
    return async (req, res, next) => {
        try {
            await handler(req, res);
        } catch (err) {
            next(err);
        }
    };
}

const router = express.Router();

router.get("/ping", (req, res) => res.json("pong"));

router.post(
    "/publish/:topic",
    asyncRoute(async (req, res) => {
        return res.status(201).json(
            await publish_event({
                topic: req.params.topic,
                ...req.body,
            })
        );
    })
);

router.post(
    "/emit/:topic",
    asyncRoute(async (req, res) => {
        return res
            .status(200)
            .json(
                await emit_event({
                    topic: req.params.topic,
                    data: req.body.data,
                })
            );
    })
);

router.get(
    "/read/:topic/:seq",
    asyncRoute(async (req, res) => {
        let event = await read_event(
            req.params.topic,
            parseInt(req.params.seq)
        );

        if (!event) {
            return res.status(204).json();
        }

        return res.status(200).json(event);
    })
);

export default router;
