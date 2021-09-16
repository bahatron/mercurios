import fastify, { FastifySchema } from "fastify";
import fastifySwagger from "fastify-swagger";
import { $logger } from "./logger";
import { $mercurios } from "./mercurios";

let server = fastify();

server.register(fastifySwagger, {
    routePrefix: "/",
    swagger: {
        info: {
            title: "Test swagger",
            description: "Mercurios API",
            version: "0.1.0",
        },
        externalDocs: {
            url: "https://swagger.io",
            description: "Find more info here",
        },
        // host: "localhost:4254",
        schemes: ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [{ name: "user", description: "User related end-points" }],
        definitions: {
            User: {
                type: "object",
                required: ["id", "email"],
                properties: {
                    id: { type: "string", format: "uuid" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string", format: "email" },
                },
            },
        },
        securityDefinitions: {
            apiKey: {
                type: "apiKey",
                name: "apiKey",
                in: "header",
            },
        },
    },
    uiConfig: {
        docExpansion: "full",
        deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
});

server.route({
    method: "GET",
    url: "/ping",
    handler: async (req, res) => {
        return res.send("pong");
    },
    schema: {
        tags: ["APM"],
    },
});

server.route({
    method: "POST",
    url: "/publish",
    handler: async (req, res) => {
        $logger.info({
            body: req.body,
        });
        let event = await $mercurios.publish("myTopic", { data: req.body });

        return res.send(event);
    },
});

server.route({
    method: "GET",
    url: "/topics",
    handler: async (req, res) => {
        $logger.info(`fetching topics....`);
        let result = await $mercurios.topics();

        return res.send(result);
    },
});

server.listen(4254, "0.0.0.0", () => {
    console.log(`playground server listening`);
});
