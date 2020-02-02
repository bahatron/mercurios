import $express, { Response, Request, NextFunction } from "express";
import $error, { Exception } from "../services/error";
import helmet from "helmet";
import $logger from "../services/logger";
import $router from "./router";
import ping from "./middleware/ping";
import cors from "cors";

const SERVER = $express();

SERVER.use($express.json());
SERVER.use(helmet());
SERVER.use(cors());

SERVER.get("/ping", ping());

SERVER.use($router);

SERVER.use(
    (err: Exception, req: Request, res: Response, next: NextFunction) => {
        let code = err.httpCode || 500;

        $logger.debug(err.message, err);

        if (code >= 500) {
            $logger.error(
                `HTTP Server - http error: ${code} - ${err.message}`,
                err
            );
        }

        return res
            .status(code)
            .json(err.httpCode ? err.message : "Internal Error");
    }
);

export default SERVER;
