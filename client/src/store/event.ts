import { MercuriosEvent } from "../client";
import { $json } from "../utils/json";

export function EventFactory({
    topic,
    timestamp,
    seq,
    data,
    key,
}: MercuriosEvent): MercuriosEvent {
    return {
        topic,
        timestamp,
        seq,
        data: $json.parse(data) ?? data,
        key,
    };
}

export const MercuriosEventSchema = {
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
            type: ["string", "null"],
        },
        data: {},
    },
};