const npm_package = require("../../package.json");

export default {
    openapi: "3.0.0",

    info: {
        title: "Mercurios Client Playground",
        version: npm_package.version,
    },

    servers: [
        {
            url: "http://localhost:4250",
        },
    ],

    paths: {
        "/publish/{topic}": {
            post: {
                description: "publishes an event",
                parameters: [
                    {
                        name: "topic",
                        in: "path",
                        type: "string",
                        required: true,
                        example: "test_topic",
                    },
                ],
                requestBody: {
                    description: "publish payload",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                // properties: {
                                //     expectedSeq: {
                                //         required: false,
                                //         type: "integer",
                                //     },
                                //     data: {
                                //         example: {},
                                //     },
                                // },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "mercurios event",
                    },
                },
            },
        },
    },

    components: {
        schemas: {},
    },
};
