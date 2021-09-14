import fastify from "fastify";
import fastifySwagger from "fastify-swagger";

let server = fastify();

server.register(fastifySwagger, {
    routePrefix: "/",
    swagger: {
        info: {
            title: "Test swagger",
            description: "Testing the Fastify swagger API",
            version: "0.1.0",
        },
        externalDocs: {
            url: "https://swagger.io",
            description: "Find more info here",
        },
        host: "localhost",
        schemes: ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
            { name: "user", description: "User related end-points" },
            { name: "code", description: "Code related end-points" },
        ],
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
});

server.listen(4254, "0.0.0.0", () => {
    console.log(`playground server listening`);
});
