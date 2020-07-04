import express from "express";
import helmet from "helmet";
import router from "./router";
import cors from "cors";
import errorHandler from "./middleware/error_handler";
import { requestLogger } from "./middleware/request_logger";

const SERVER = express();

SERVER.use(express.json({ limit: "2mb" }));
SERVER.use(helmet());
SERVER.use(cors());

SERVER.use(requestLogger);
SERVER.use(router);

SERVER.use(errorHandler);

export default SERVER;
