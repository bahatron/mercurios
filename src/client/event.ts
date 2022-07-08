import { parse } from "@bahatron/utils/lib/helpers";
import { MercuriosEvent } from ".";
import { $validator } from "../utils/validator";

export function EventFactory({
    topic,
    timestamp,
    seq,
    data,
    key,
}: any): MercuriosEvent {
    return {
        topic,
        timestamp,
        seq,
        data: parse(data) ?? data,
        key: $validator.nullableString(key),
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
