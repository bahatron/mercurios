import mercurios, { PublishOptions } from "./index";
import fastify from "fastify";
import $logger from "./utils/logger";

let $mercurios = mercurios.connect({
    url: "http://server:4254",
    id: "client_playground",
});

$mercurios.subscribe("heartbeat", (event) => {
    $logger.debug("heartbeat");
});

setInterval(async () => {
    await $mercurios.publish("heartbeat");
}, 30000);

const server = fastify({});

server.get("/ping", async (request, reply) => {
    reply.send("pong");
});

/**
 * persists an event
 */
server.post("/publish/:topic", async (request, reply) => {
    // server.log.debug(`publishing topic`, request);
    $logger.debug("publishing topic", {
        params: request.params,
        body: request.body,
        query: request.query,
    });

    if (parseInt(request.query.interval)) {
        let result = await new Promise<any>((resolve) => {
            setInterval(
                async () => {
                    let result = await $mercurios.publish(
                        request.params.topic,
                        {
                            data: request.body,
                        }
                    );

                    /** @todo: possible unnecessary memory footmark? */
                    resolve(result);
                },

                parseInt(request.query.interval) * 1000
            );
        });

        return reply.send(result);
    }

    let result = await $mercurios.publish(request.params.topic, {
        data: request.body,
    });

    return reply.send(result);
});

server.post("/subscribe/:topic", async (request, reply) => {
    // server.log.debug(`subscribing to topic`, request);
    $logger.debug(`subscribing to topic`, {
        params: request.params,
        body: request.body,
        query: request.query,
    });

    await $mercurios.subscribe(request.params.topic, (event) => {
        // server.log.info("event");
        $logger.info(`playground client received event`, {
            topic: request.params.topic,
            event,
        });
    });

    reply.send("ok");
});

server.listen(
    parseInt(process.env.PLAYGROUND_PORT || "") || 3000,
    "0.0.0.0",
    (err, address) => {
        if (err) {
            throw err;
        }
        // server.log.info(`server listening on ${address}`);
        $logger.info(`Playground server listening  on ${address}`);
    }
);
