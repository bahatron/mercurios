import express from "express";
import asyncRoute from "./utils/async_route";
import publish_event from "../domain/publish_event";
import emit_event from "../domain/emit_event";
import read_event from "../domain/read_event";

const router = express.Router();

router.get("/ping", (req, res) => res.json("pong"));

router.post(
    "/stream/:topic",
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
            .json(emit_event({ topic: req.params.topic, data: req.body.data }));
    })
);

router.get(
    "/stream/:topic/:seq",
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
