import { Request, Response, NextFunction, RequestHandler } from "express";
import $uuid from "uuid";
import { EventEmitter } from "events";
import $nats from "../../services/nats";

export default function ping(): RequestHandler {
    const _obs = new EventEmitter();

    $nats.subscribe("ping_received", (err, { data }) => {
        _obs.emit(data.uid);
    });

    return function(req: Request, res: Response, next: NextFunction) {
        let uid = $uuid.v4();

        _obs.once(uid, () => {
            return res.json("pong");
        });

        $nats.publish("ping_received", { uid });
    };
}
