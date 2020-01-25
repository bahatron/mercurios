import { Request, Response, NextFunction, RequestHandler } from "express";
import $uuid from "uuid";
import { EventEmitter } from "events";
import $nats from "../../services/nats";
import $logger from "../../services/logger";

export default function ping(): RequestHandler {
    $logger.warning(`ONLY ONCE I SAY`);

    const _obs = new EventEmitter();

    $nats.subscribe("ping_received", (err, { data }) => {
        _obs.emit(data.uid);
    });

    return function(req: Request, res: Response, next: NextFunction) {
        let uid = $uuid.v4();

        _obs.once(uid, () => {
            $logger.warning(`got a ping`);
            return res.json("pong");
        });

        $nats.publish("ping_received", { uid });
    };
}
