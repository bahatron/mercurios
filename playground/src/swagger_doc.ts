export default {
    openapi: "3.0.0",

    info: {
        title: "Mercurios Client Playground",
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
                    {
                        name: "interval",
                        in: "query",
                        type: "number",
                        required: false,
                        example: "0",
                    },
                ],
                requestBody: {
                    description: "publish payload",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    expectedSeq: {
                                        required: false,
                                        type: "integer",
                                    },
                                    data: {
                                        required: false,
                                        example: {},
                                    },
                                    key: {
                                        type: "string",
                                        required: false,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "mercurios event",
                    },
                },
            },
        },

        "/emit/{topic}": {
            post: {
                description: "emits an event",
                parameters: [
                    {
                        name: "topic",
                        in: "path",
                        type: "string",
                        required: true,
                        example: "test_topic",
                    },
                    {
                        name: "interval",
                        in: "query",
                        type: "number",
                        required: false,
                        example: "0",
                    },
                ],
                requestBody: {
                    description: "publish payload",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: {
                                        required: false,
                                        example: {},
                                    },
                                    key: {
                                        type: "string",
                                        required: false,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "mercurios event",
                    },
                },
            },
        },

        "/read/{topic}/{seq}": {
            get: {
                description: "read an event",
                parameters: [
                    {
                        name: "topic",
                        in: "path",
                        required: true,
                        example: "test_topic",
                    },
                    {
                        name: "seq",
                        in: "path",
                        type: "number",
                        required: true,
                        example: "1",
                    },
                ],
                responses: {
                    200: {
                        description: "mercurios event",
                    },
                },
            },
        },

        "/filter/{topic}": {
            get: {
                description: "filters a topic",
                parameters: [
                    {
                        name: "topic",
                        in: "path",
                        required: true,
                        example: "test_topic",
                    },
                    {
                        name: "from",
                        in: "query",
                        type: "number",
                        required: false,
                        example: "1",
                    },
                    {
                        name: "to",
                        in: "query",
                        type: "number",
                        required: false,
                    },
                    {
                        name: "key",
                        in: "query",
                        type: "string",
                        required: false,
                        example: "",
                    },
                ],
                responses: {
                    200: {
                        description: "mercurios event",
                    },
                },
            },
        },

        "/subscribe/{subject}": {
            put: {
                description: "read an event",
                parameters: [
                    {
                        name: "subject",
                        in: "path",
                        required: true,
                        example: "test_topic",
                    },
                ],
                responses: {
                    200: {
                        description: "subscription id",
                    },
                },
            },
        },

        "/unsubscribe/{subscription}": {
            put: {
                description: "read an event",
                parameters: [
                    {
                        name: "subscription",
                        in: "path",
                        required: true,
                    },
                ],
                responses: {
                    200: {
                        description: "confirmation",
                    },
                },
            },
        },
    },

    components: {
        schemas: {},
    },
};
