import { Router, RequestHandler } from "express";
import publishEvent from "../controllers/publish-event";
import emitEvent from "../controllers/emit-event";
import readEvent from "../controllers/read-event";
import listTopics from "../controllers/list-topics";
import filterTopic from "../controllers/filter-topic";
import { $validator } from "../utils/validator";
import { $json } from "../utils/json";
import { ping } from "../controllers/ping";

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
        handler: async (req, res) => res.json(await ping()),
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
            let { seq }: any = req.params;

            if (seq !== "latest" && isNaN(parseInt(seq))) {
                return res.status(400).json({
                    error: `Invalid sequence, must be either 'latest' or a number, recieved: ${seq}`,
                });
            }

            let event = await readEvent(req.params.topic, seq);
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
            return res
                .status(200)
                .json(await filterTopic(req.params.topic, req.query));
        }),
    },
];

routes.map((route) => {
    (router as any)[route.method](route.path, route.handler);
});
