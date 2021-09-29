import express from "express";
import { $logger } from "./logger";
import { $mercurios } from "./mercurios";
import { swaggerDocs } from "./swagger";
import morgan from "morgan";
import { Json } from "@bahatron/utils";

const swagger = require("swagger-ui-express");

function expressServer() {
    const app = express();

    app.use(morgan("tiny"));

    app.get("/", (req, res) => {
        res.redirect("/docs");
    });

    app.use("/docs", swagger.serve, swagger.setup(swaggerDocs));

    app.get("/ping", (req, res) => {
        res.json("pong");
    });

    app.post("/append/:topic", async (req, res) => {
        try {
            return res.json(
                await $mercurios.append(req.params.topic, req.body)
            );
        } catch (err) {
            return res.status(500).json(err);
        }
    });

    app.post("/read/:topic/:seq", async (req, res) => {
        try {
            return res.json(
                await $mercurios.read(
                    req.params.topic,
                    parseInt(req.params.seq.toString())
                )
            );
        } catch (err) {
            return res.status(500).json(err);
        }
    });

    app.post("/filter/:topic", async (req, res) => {
        try {
            return res.json(
                await $mercurios.filter(req.params.topic, req.query)
            );
        } catch (err) {
            return res.status(500).json(err);
        }
    });

    app.get("/topics", async (req, res) => {
        try {
            let { like } = req.query as any;
            let withEvents = Json.parse(req.query.withEvents);

            $logger.debug(
                { like, withEvents: Json.parse(withEvents) },
                "newly fetching topics..."
            );

            return res.json(
                await $mercurios.topics({
                    like,
                    withEvents: Json.parse(withEvents) as any,
                })
            );
        } catch (err) {
            return res.status(500).json(err);
        }
    });

    return app;
}

export const app = expressServer();

app.listen(4254, () => {
    $logger.info(`mercurios playground server started at port 4254`);
});
