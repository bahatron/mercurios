import express, {
    ErrorRequestHandler,
    Request,
    Response,
    RequestHandler,
} from "express";

import { Logger } from "@bahatron/utils/lib/logger";
import { swaggerDocs } from "./swagger";
import morgan from "morgan";
import { Json } from "@bahatron/utils";
import { mercurios, EventFilters } from "..";

const $mercurios = mercurios({
    url:
        process.env.MERCURIOS_TEST_URL ||
        "postgres://admin:secret@localhost:5432/postgres",
    debug: true,
});

const $logger = Logger({
    pretty: process.env.NODE_ENV !== "production",
});

const swagger = require("swagger-ui-express");
const asyncRoute = (
    handler: (req: Request, res: Response) => void
): RequestHandler => {
    return (req, res, next) => {
        return Promise.resolve(handler(req, res))
            .then(() => next())
            .catch(next);
    };
};

function expressServer() {
    const app = express();

    app.use(morgan("tiny"));

    app.get("/", (req, res) => {
        res.redirect("/docs");
    });

    app.use("/docs", swagger.serve, swagger.setup(swaggerDocs));

    app.get("/ping", (req, res) => {
        res.json("pong");
    });

    app.post(
        "/append/:topic",
        asyncRoute(async (req, res) => {
            return res.json(
                await $mercurios.append(req.params.topic, req.body)
            );
        })
    );

    app.post(
        "/read/:topic/:seq",
        asyncRoute(async (req, res) => {
            return res.json(
                await $mercurios.read(
                    req.params.topic,
                    parseInt(req.params.seq.toString())
                )
            );
        })
    );

    app.post(
        "/filter/:topic",
        asyncRoute(async (req, res) => {
            return res.json(
                await $mercurios.filter(req.params.topic, req.query)
            );
        })
    );

    app.get(
        "/topics",
        asyncRoute(async (req, res) => {
            let { like } = req.query as any;
            let withEvents = Json.parse(req.query.withEvents) as EventFilters;

            $logger.debug({ like, withEvents }, "fetching topics...");

            return res.json(
                await $mercurios.topics({
                    like,
                    withEvents,
                })
            );
        })
    );

    app.use(<ErrorRequestHandler>(
        async function errorHandler(err, req, res, next) {
            $logger.warning(err, "http server error");

            return res.status(500).json(err);
        }
    ));

    return app;
}

export const app = expressServer();

app.listen(4254, () => {
    $logger.info(`mercurios playground server started at port 4254`);
});
