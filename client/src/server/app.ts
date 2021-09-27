import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { swaggerDocs } from "./swagger";
import cors from "cors";
import { setRequestContext } from "./middleware/request-context";
import { Logger } from "@bahatron/utils/lib/logger";
import { StoreDriver } from "../store";
import { pingController } from "./routes/ping";

export function MercuriosServer({
    logger,
    store,
    swagger = false,
}: {
    swagger?: boolean;
    logger: Logger;
    store: Promise<StoreDriver>;
}) {
    const app = express();

    app.use(express.json() as any);
    app.use(cors());
    app.use(setRequestContext(logger));
    app.use(requestLogger(logger));
    if (swagger) {
        const swagger = require("swagger-ui-express");
        app.use("/docs", swagger.serve, swagger.setup(swaggerDocs));
    }

    app.get("/ping", pingController);

    app.use(errorHandler(logger));
    return app;
}
