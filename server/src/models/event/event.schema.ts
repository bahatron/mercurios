import { Schema } from "jsonschema";

export const EventSchema: Schema = {
    type: "object",
    additionalProperties: false,
    required: ["published_at", "topic"],
    properties: {
        topic: {
            type: "string",
        },
        published_at: {
            type: "string",
            format: "date-time",
        },
        key: {
            type: "string",
        },
        seq: {
            type: "integer",
        },
        data: {},
    },
};
