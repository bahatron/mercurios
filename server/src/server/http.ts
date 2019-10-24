import express, { Response, Request, NextFunction } from "express";
import $error, { Exception } from "../services/error";
import $domain from "../domain";
import helmet from "helmet";
import asyncRoute from "./middleware/asyncRoute";

const SERVER = express();

SERVER.use(express.json());
SERVER.use(helmet());

SERVER.get("/ping", (req, res) => {
    res.json("pong");
});

SERVER.post(
    `/streams`,
    asyncRoute(async (req, res) => {
        const { topic, schema } = req.body;

        if (!topic) {
            throw $error.Error("topic is required", 400);
        }

        const stream = await $domain.createStream(topic, schema);

        if (!stream) {
            return res.status(200).json();
        }

        return res.status(201).json(stream);
    })
);

SERVER.post(
    "/stream/:topic",
    asyncRoute(async (req, res) => {
        let event = await $domain.publishEvent(req.params.topic, req.body);

        return res.status(201).json(event);
    })
);

SERVER.get(
    "/stream/:topic/:seq",
    asyncRoute(async (req, res) => {
        let event = await $domain.readEvent(req.params.topic, req.params.seq);

        return res.status(200).json(event);
    })
);

SERVER.use(
    (err: Exception, req: Request, res: Response, next: NextFunction) => {
        let code = err.httpCode || 500;
        if (code >= 500) {
            console.log(err);
        }

        return res
            .status(code)
            .json(err.httpCode ? err.message : "Internal Error");
    }
);

export default SERVER;
