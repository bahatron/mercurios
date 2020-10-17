import { Router, RequestHandler } from "express";
import publishEvent from "../handlers/publish_event";
import emitEvent from "../handlers/emit_event";
import readEvent from "../handlers/read_event";
import listTopics from "../handlers/list_topics";
import filterTopic from "../handlers/filter_topic";
import $validator from "../utils/validator";

function asyncRoute(handler: RequestHandler): RequestHandler {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

const router = Router();

router.get("/ping", (req, res) => res.json("pong"));

router.get(
    "/topics",
    asyncRoute(async (req, res) => {
        let { like } = req.query;
        return res.status(200).json(await listTopics(like as string));
    })
);

router.post(
    "/publish/:topic",
    asyncRoute(async (req, res) => {
        return res.status(201).json(
            await publishEvent({
                topic: req.params.topic,
                ...req.body,
            })
        );
    })
);

router.post(
    "/emit/:topic",
    asyncRoute(async (req, res) => {
        return res.status(200).json(
            await emitEvent({
                topic: req.params.topic,
                ...req.body,
            })
        );
    })
);

router.get(
    "/read/:topic/:seq",
    asyncRoute(async (req, res) => {
        let event = await readEvent(req.params.topic, parseInt(req.params.seq));
        if (!event) {
            return res.status(204).json();
        }

        return res.status(200).json(event);
    })
);

router.get(
    "/filter/:topic",
    asyncRoute(async (req, res) => {
        let { from, to, key } = req.query;

        return res.status(200).json(
            await filterTopic(req.params.topic, {
                from: $validator.optionalInt(from) ?? undefined,
                to: $validator.optionalInt(to) ?? undefined,
                key: $validator.optionalString(key) ?? undefined,
            })
        );
    })
);

export default router;
