import express from "express";
import helmet from "helmet";
import { router } from "./router";
import http from "http";
import cors from "cors";
import errorHandler from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import createWsServer from "./websocket/ws-server";
import { swaggerDocs } from "./swagger";
import { requestId } from "./middleware/request-id";
const app = express();
export const server = new http.Server(app);
createWsServer(server);

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use(requestId);
app.use(requestLogger);
if (process.env.MERCURIOS_SWAGGER === "1") {
    const swagger = require("swagger-ui-express");

    app.use("/docs", swagger.serve, swagger.setup(swaggerDocs));
    app.get("/docs-json", (req, res) => res.json(swaggerDocs));
}

app.use(router);

app.use(errorHandler);
