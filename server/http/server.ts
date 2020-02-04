import $express from "express";
import helmet from "helmet";
import $router from "./router";
import ping from "./middleware/ping";
import cors from "cors";
import errorHandler from "./middleware/error_handler";

const SERVER = $express();

SERVER.use($express.json());
SERVER.use(helmet());
SERVER.use(cors());

SERVER.get("/ping", ping());

SERVER.use($router);

SERVER.use(errorHandler);

export default SERVER;
