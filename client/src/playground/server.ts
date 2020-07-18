import express from "express";
const swagger = require("swagger-ui-express");
import swagger_doc from "./swagger_doc";
import { MercuriosClient } from "../client/client";
import $logger from "../utils/logger";

const app = express();
const client = MercuriosClient(process.env.MERCURIOS_URL || "");

app.use(express.json());

app.use("/docs", swagger.serve, swagger.setup(swagger_doc));

app.post("/publish/:topic", async (req, res, next) => {
    try {
        let event = await client.publish(req.params.topic, req.body);
        $logger.inspect(event);
        return res.json(event);
    } catch (err) {
        next(err);
    }
});

app.post("/emit/:topic", async (req, res, next) => {
    try {
        return res.json(await client.emit(req.params.topic, req.body));
    } catch (err) {
        next(err);
    }
});

app.use(<express.ErrorRequestHandler>function (err, req, res, next) {
    $logger.error(err.message, err);

    return res.status(500).json(err);
});

app.listen(4250, () => {
    $logger.info("client playground server listening on port 4250");
});
