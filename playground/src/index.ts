import express from "express";
const swagger = require("swagger-ui-express");
import swagger_doc from "./swagger_doc";
import $logger from "./utils/logger";
import mercurios, { MercuriosClient } from "@bahatron/mercurios";

const client: MercuriosClient = mercurios.connect({
    url: process.env.MERCURIOS_URL || "",
    id: "mercurios_playground",
});

function publishInterval(params: {
    interval: number;
    topic: string;
    body: any;
    client: MercuriosClient;
}) {
    let { client, interval, topic, body } = params;

    setInterval(
        () =>
            client
                .publish(topic, body)
                .then(() => $logger.info("event published")),
        interval * 1000
    );
}

const app = express();
app.use(express.json());

app.use("/docs", swagger.serve, swagger.setup(swagger_doc));

app.get("/", (req, res) => res.redirect(301, "/docs/"));

app.post("/publish/:topic", async (req, res, next) => {
    try {
        let event = await client.publish(req.params.topic, req.body);
        let { interval } = req.query;

        if (parseFloat(interval?.toString() || "")) {
            publishInterval({
                topic: req.params.topic,
                body: req.body,
                client,
                interval: parseFloat(interval as string),
            });
        }

        return res.json(event);
    } catch (err) {
        next(err);
    }
});

app.post("/emit/:topic", async (req, res, next) => {
    try {
        let event = await client.emit(req.params.topic, req.body);
        let { interval } = req.query;

        if (parseFloat(interval?.toString() || "")) {
            publishInterval({
                topic: req.params.topic,
                body: req.body,
                client,
                interval: parseFloat(interval as string),
            });
        }
        return res.json(event);
    } catch (err) {
        next(err);
    }
});

app.get("/read/:topic/:seq", async (req, res, next) => {
    let { topic, seq } = req.params;

    return res.json(await client.read(topic, parseInt(seq)));
});

app.get("/filter/:topic", async (req, res, next) => {
    return res.json(await client.filter(req.params.topic, req.query));
});

app.put("/subscribe/:subject", async (req, res, next) => {
    let sub = await client.subscribe(req.params.subject, (msg) => {
        $logger.info(
            `received message - subject: ${msg.subject} - subscription: ${msg.subscription}`
        );
        $logger.inspect(msg.event);
    });

    return res.json(sub);
});

app.put("/unsubscribe/:subscription", async (req, res, next) => {
    return res.json(await client.unsubscribe(req.params.subscription));
});

app.use(<express.ErrorRequestHandler>function (err, req, res, next) {
    $logger.error(err);

    return res.status(500).json(err);
});

app.listen(4250, () => {
    $logger.info("client playground server listening on port 4250");
});
