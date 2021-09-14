import { Schema } from "jsonschema";

export const MercuriosEventSchema: Schema = {
    type: "object",
    additionalProperties: false,
    required: ["timestamp", "topic", "seq"],
    properties: {
        topic: {
            type: "string",
        },
        seq: {
            type: "integer",
        },
        timestamp: {
            type: "string",
            format: "date-time",
        },
        key: {
            type: "string",
        },
        data: {},
    },
};
