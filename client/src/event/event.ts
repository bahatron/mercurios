import { pickBy } from "lodash";
import { $error } from "../utils/error";
import { $json } from "../utils/json";
import { $validator } from "../utils/validator";
import { MercuriosEventSchema } from "./event.schema";

export interface MercuriosEvent {
    timestamp: string;
    topic: string;
    seq: number;
    key?: string;
    data?: any;
}

export function MercuriosEvent({
    topic,
    timestamp,
    seq,
    data,
    key,
}: MercuriosEvent): MercuriosEvent {
    // this is because undefined is returned as null by mysql/postgres
    let event: any = pickBy(
        {
            topic,
            timestamp,
            seq,
            data: $json.parse(data) ?? data,
            key,
        },
        Boolean
    );

    let errors = $validator.json(event, MercuriosEventSchema);

    if (errors.length) {
        throw $error.ValidationFailed("Invalid event payload", {
            errors: errors,
            payload: event,
        });
    }

    return event;
}
