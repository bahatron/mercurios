import express from "express";
import helmet from "helmet";
import router from "./router";
import http from "http";
import cors from "cors";
import errorHandler from "./middleware/error_handler";
import { requestLogger } from "./middleware/request_logger";
import createWsServer from "./websocket/ws-server";

export const app = express();
createWsServer(new http.Server(app));

app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(cors());

app.use(requestLogger);
app.use(router);

app.use(errorHandler);
