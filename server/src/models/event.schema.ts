import { Schema } from "jsonschema";

export const MercuriosEventSchema: Schema = {
    type: "object",
    additionalProperties: false,
    required: ["published_at", "topic"],
    properties: {
        topic: {
            type: "string",
        },
        seq: {
            type: "integer",
        },
        published_at: {
            type: "string",
            format: "date-time",
        },
        key: {
            type: ["string", "null"],
        },
        data: {},
    },
};
