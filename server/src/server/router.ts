import { Router, RequestHandler } from "express";
import publishEvent from "../handlers/publish-event";
import emitEvent from "../handlers/emit-event";
import readEvent from "../handlers/read-event";
import listTopics from "../handlers/list-topics";
import filterTopic from "../handlers/filter-topic";
import { $validator } from "../utils/validator";
import { $json } from "../utils/json";

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
        let { like, withEvents } = req.query;
        return res.status(200).json(
            await listTopics({
                like: $validator.optionalString(like),
                withEvents: $json.parse(withEvents),
            })
        );
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
            return res.status(404).json();
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
