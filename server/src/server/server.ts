import express from "express";
import helmet from "helmet";
import router from "./router";
import http from "http";
import cors from "cors";
import errorHandler from "./middleware/error_handler";
import { requestLogger } from "./middleware/request_logger";
import createWsServer from "./websocket/ws-server";

const app = express();
export const server = new http.Server(app);
createWsServer(server);

app.use(express.json());
app.use(helmet());
app.use(cors() as any);

app.use(requestLogger);
app.use(router);

app.use(errorHandler);
