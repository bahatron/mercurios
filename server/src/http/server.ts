import express from "express";
import helmet from "helmet";
import router from "./router";
import cors from "cors";
import errorHandler from "./middleware/error_handler";
import { requestLogger } from "./middleware/request_logger";

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(helmet());
app.use(cors());

app.use(requestLogger);
app.use(router);

app.use(errorHandler);

export default app;
