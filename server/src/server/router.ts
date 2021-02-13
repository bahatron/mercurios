import { Router, RequestHandler } from "express";
import publishEvent from "../handlers/publish-event";
import emitEvent from "../handlers/emit-event";
import readEvent from "../handlers/read-event";
import listTopics from "../handlers/list-topics";
import filterTopic from "../handlers/filter-topic";
import { $validator } from "../utils/validator";
import { $json } from "../utils/json";
import { healthcheck } from "../handlers/healthcheck";

export function asyncRoute(handler: RequestHandler): RequestHandler {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}

export interface Route {
    path: string;
    // method: keyof Router;
    method: "get" | "post" | "put" | "delete";
    handler: (...params: any[]) => void | ((...params: any[]) => void)[];
}

export const router = Router();

const routes: Route[] = [
    {
        method: "get",
        path: "/topics",
        handler: asyncRoute(async (req, res) => {
            let { like, withEvents } = req.query;
            return res.status(200).json(
                await listTopics({
                    like: $validator.optionalString(like),
                    withEvents: $json.parse(withEvents),
                })
            );
        }),
    },

    {
        method: "get",
        path: "/ping",
        handler: (req, res) => res.json("pong"),
    },

    {
        method: "get",
        path: "/healthcheck",
        handler: asyncRoute(async (req, res) => {
            return res.status(200).json(await healthcheck());
        }),
    },

    {
        method: "post",
        path: "/publish/:topic",
        handler: asyncRoute(async (req, res) => {
            return res.status(201).json(
                await publishEvent({
                    topic: req.params.topic,
                    ...req.body,
                })
            );
        }),
    },

    {
        method: "post",
        path: "/emit/:topic",
        handler: asyncRoute(async (req, res) => {
            return res.status(200).json(
                await emitEvent({
                    topic: req.params.topic,
                    ...req.body,
                })
            );
        }),
    },

    {
        method: "get",
        path: "/read/:topic/:seq",
        handler: asyncRoute(async (req, res) => {
            let event = await readEvent(
                req.params.topic,
                parseInt(req.params.seq)
            );
            if (!event) {
                return res.status(404).json();
            }

            return res.status(200).json(event);
        }),
    },

    {
        method: "get",
        path: "/filter/:topic",
        handler: asyncRoute(async (req, res) => {
            let { from, to, key } = req.query;

            return res.status(200).json(
                await filterTopic(req.params.topic, {
                    from: $validator.optionalInt(from) ?? undefined,
                    to: $validator.optionalInt(to) ?? undefined,
                    key: $validator.optionalString(key) ?? undefined,
                })
            );
        }),
    },
];

routes.map((route) => {
    (router as any)[route.method](route.path, route.handler);
});
