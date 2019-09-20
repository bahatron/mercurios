import { Schema } from "jsonschema";
import $error from "../../services/error";
import $date from "../../services/date";
import $db from "../../services/db";
import $json from "../../services/json";
import $dispatcher from "../../services/dispatcher";
import $validator from "../../services/validator";
import { STREAM_TABLE } from "./stream_repository";
import eventFactory, { Event } from "./event_factory";

export class Stream {
    public readonly schema: Schema;

    constructor(public readonly topic: string, schema?: Schema) {
        this.schema = schema ? $json.parse(schema) : {};
    }

    public async append(data: any = {}): Promise<Event> {
        if (!$validator.validate(data, this.schema)) {
            throw $error.ValidationFailed("validation failed for event data");
        }

        let published_at = $date.create();

        const seq = await $db.insert(STREAM_TABLE(this.topic), {
            published_at,
            data: $json.stringify(data),
        });

        if (!seq) {
            throw $error.InternalError(
                `Error appending event to stream: no sequence returned from DB`
            );
        }

        let event = eventFactory(this.topic, seq, published_at, data);

        await $dispatcher.publish(STREAM_TABLE(this.topic), event);

        return event;
    }

    public async read(seq: number): Promise<Event | undefined> {
        let result = await $db.findOneBy(STREAM_TABLE(this.topic), { id: seq });
        if (!result) {
            return undefined;
        }

        let { id, published_at, data } = result;

        return eventFactory(this.topic, id, published_at, data);
    }
}

/** @todo: validate schema is valid jsonschema.Schema. Is that even possible? */
export default function streamFactory(topic: string, schema?: Schema) {
    return new Stream(topic, schema);
}
