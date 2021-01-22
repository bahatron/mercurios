import express from "express";
import helmet from "helmet";
import { router } from "./router";
import http from "http";
import cors from "cors";
import errorHandler from "./middleware/error_handler";
import { requestLogger } from "./middleware/request_logger";
import createWsServer from "./websocket/ws-server";
import { swaggerDocs } from "./swagger";

const app = express();
export const server = new http.Server(app);
createWsServer(server);

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use(requestLogger);
if (process.env.MERCURIOS_SWAGGER === "1") {
    const swagger = require("swagger-ui-express");

    app.use("/docs", swagger.serve, swagger.setup(swaggerDocs));
    app.get("/docs-json", (req, res) => res.json(swaggerDocs));
}

app.use(router);

app.use(errorHandler);
