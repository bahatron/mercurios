import $express, { Response, Request, NextFunction } from "express";
import $error, { Exception } from "../services/error";
import helmet from "helmet";
import $logger from "../services/logger";
import $nats from "../services/nats";
import $uuid from "uuid";
import { EventEmitter } from "events";
import $router from "./router";

const SERVER = $express();

SERVER.use($express.json());
SERVER.use(helmet());

const OBS = new EventEmitter();
$nats.subscribe("ping_received", (err, { data }) => {
    OBS.emit(data.uid);
});

SERVER.get("/ping", (req, res) => {
    let uid = $uuid.v4();

    OBS.once(uid, () => {
        return res.json("pong");
    });

    $nats.publish("ping_received", { uid });
});

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
