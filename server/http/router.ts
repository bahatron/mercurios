import express from "express";
import $publishEvent from "../domain/publish_event";
import $readEvent from "../domain/read_event";
import $emitEvent from "../domain/emit_event";
import asyncRoute from "./utils/async_route";

const $router = express.Router();

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

$router.post(
    "/emit/:topic",
    asyncRoute(async (req, res) => {
        return res
            .status(200)
            .json($emitEvent({ topic: req.params.topic, data: req.body.data }));
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
