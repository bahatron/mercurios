const EventRequest = {
    type: "object",
    properties: {
        expectedSeq: {
            required: false,
            type: "integer",
        },
        data: {
            required: false,
        },
        key: {
            type: "string",
            required: false,
        },
    },
};

export const swaggerDocs = {
    openapi: "3.0.0",

    info: {
        title: "Mercurios HTTP API",
    },

    servers: [
        {
            url: "http://localhost:4254",
        },
    ],

    paths: {
        "/append/{topic}": {
            post: {
                description: "appends an event",
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
                            schema: EventRequest,
                        },
                    },
                },
                responses: {
                    201: {
                        description: "event published",
                        content: {
                            "application/json": {
                                schema: {},
                            },
                        },
                    },
                    417: {
                        description:
                            "expected sequence does not match next sequence",
                    },
                    500: {
                        description: "internal server error",
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
                        example: "latest",
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
                    },
                    {
                        name: "after",
                        in: "query",
                        type: {
                            type: "string",
                            format: "date-time",
                        },
                        required: false,
                    },
                    {
                        name: "before",
                        in: "query",
                        type: {
                            type: "string",
                            format: "date-time",
                        },
                        required: false,
                    },
                ],
                responses: {
                    200: {
                        description: "mercurios event",
                    },
                },
            },
        },

        "/topics": {
            get: {
                description: "list topics",
                parameters: [
                    {
                        name: "like",
                        in: "query",
                        type: "string",
                        required: false,
                    },
                    {
                        name: "withEvents",
                        in: "query",
                        required: false,
                        type: {
                            type: "object",
                            properties: {
                                from: {
                                    type: "integer",
                                },
                                to: {
                                    type: "integer",
                                },
                                key: {
                                    type: "string",
                                },
                                after: {
                                    type: {
                                        type: "string",
                                        format: "date-time",
                                    },
                                },
                                before: {
                                    type: {
                                        type: "string",
                                        format: "date-time",
                                    },
                                },
                            },
                        },
                        example: JSON.stringify({
                            from: 1,
                            to: 20,
                            after: "2020",
                            before: "2030",
                        }),
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        description: "limit of topics to receive",
                        type: {
                            type: "integer",
                        },
                    },
                    {
                        name: "offset",
                        in: "query",
                        required: false,
                        description: "offset",
                        type: {
                            type: "integer",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "mercurios event",
                    },
                },
            },
        },

        "/ping": {
            get: {
                tags: ["Monitoring"],
                description: "ping",
                responses: {
                    200: {
                        "application/json": {
                            schema: {
                                type: "string",
                            },
                        },
                    },
                },
            },
        },
    },

    components: {
        schemas: {},
    },
};
