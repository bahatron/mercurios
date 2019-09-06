import express, { Response, Request, NextFunction } from "express";
import $error, { Exception } from "@bahatron/error";
import $domain from "../domain";

const SERVER = express();

/** @description: third party middleware */
SERVER.use(express.json());

/** @description: routes */
/** @todo: move routes to separate file */
SERVER.get("/ping", (req, res) => {
    res.json("pong");
});

SERVER.post("/streams", async (req, res, next) => {
    try {
        const { topic, schema } = req.body;

        if (!topic) {
            throw $error.Error("topic is required", 400);
        }

        if (await $domain.streams.exists(topic)) {
            let stream = await $domain.streams.fetch(topic);

            return res.status(200).json(stream);
        }

        return res
            .status(201)
            .json(await $domain.streams.create(topic, schema));
    } catch (err) {
        return next(err);
    }
});

SERVER.post("/stream/:topic", async (req, res, next) => {
    try {
        const { data } = req.body;

        let event = await $domain.publishEvent(req.params.topic, data);

        return res.status(201).json(event);
    } catch (err) {
        return next(err);
    }
});

SERVER.get("/stream/:topic/:seq", async (req, res, next) => {
    try {
        let event = await $domain.readEvent(req.params.topic, req.params.seq);

        return res.status(200).json(event);
    } catch (err) {
        next(err);
    }
});

/** @todo: move this to @bahatron/error NPM package */
SERVER.use(
    (err: Exception, req: Request, res: Response, next: NextFunction) => {
        console.log(`HTTP API ERROR: ${err.message}`);
        console.log(err);
        res.status(err.httpCode || 500).json(
            err.httpCode ? err.message : "Internal Error"
        );
    }
);

export default SERVER;
