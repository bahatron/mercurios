import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { swaggerDocs } from "./swagger";
import cors from "cors";
import { setRequestContext } from "./middleware/request-context";
import { router } from "./router";
import { Logger } from "@bahatron/utils/lib/logger";
const swagger = require("swagger-ui-express");

export function MercuriosServer(logger: Logger) {
    const app = express();

    app.use(express.json() as any);
    app.use(cors());

    app.use(setRequestContext(logger));

    app.use("/", swagger.serve, swagger.setup(swaggerDocs));

    app.use(requestLogger(logger));

    app.use(router);

    app.use(errorHandler(logger));

    return app;
}
