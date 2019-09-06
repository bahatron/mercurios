import { Schema } from "jsonschema";
import $error from "../../services/error";
import eventFactory, { Event } from "../events/event_factory";
import $date from "../../services/date";
import $db from "../../services/db";
import $json from "../../services/json";
import $dispatcher from "../../services/dispatcher";
import $validator from "../../services/validator";

/** @todo: find a better way to do this so the name of the class can be Stream? */
export type Stream = StreamClass;

export const TABLE_NAME = (topic: string): string => {
    return `stream:_${topic}`;
};

/**
 * @description a Stream is an EventRepository in industry's OOP
 */
class StreamClass {
    public readonly schema: Schema;

    constructor(public readonly topic: string, schema?: Schema) {
        this.schema = schema ? $json.parse(schema) : {};
    }

    public async init(): Promise<StreamClass> {
        await $db.createTable(TABLE_NAME(this.topic), function(table) {
            table.increments();
            table.string("published_at");
            table.text("data", "longtext");
        });

        return this;
    }

    public async append(data: any = {}): Promise<Event> {
        if (!$validator.validate(data, this.schema)) {
            throw $error.ValidationFailed("validation failed for event data");
        }

        let published_at = $date.create();

        const seq = await $db.insert(TABLE_NAME(this.topic), {
            published_at,
            data: $json.stringify(data)
        });

        if (!seq) {
            throw $error.InternalError(
                `Error appending event to stream: no sequence returned from DB`
            );
        }

        let event = eventFactory(this.topic, seq, published_at, data);

        await $dispatcher.publish(TABLE_NAME(this.topic), event);

        return event;
    }

    public async read(seq: number): Promise<Event | undefined> {
        let result = await $db.findOneBy(TABLE_NAME(this.topic), { id: seq });
        if (!result) {
            return undefined;
        }

        let { id, published_at, data } = result;

        return eventFactory(this.topic, id, published_at, data);
    }
}

/** @todo: validate schema is valid jsonschema.Schema */
export default function streamFactory(topic: string, schema?: Schema) {
    return new StreamClass(topic, schema);
}
