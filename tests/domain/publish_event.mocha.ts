import $domain from "../../src/domain";
import $assertions, { Type } from "../../src/services/assertions";
import $mocha from "../settings.mocha";
import $db from "../../src/services/db";
import $json from "../../src/services/json";
import { TABLE_NAME } from "../../src/domain/streams/stream_factory";

describe("Publish Event", () => {
    const EVENT_SCHEMA: Record<string, Type> = {
        seq: "number",
        topic: "string",
        published_at: "date_string",
        data: "any"
    };

    describe("Scenario: without schema", () => {
        const TOPIC = "publish_event_no_schema_test";
        const EVENT_DATA = "event_data";

        before(async () => {
            await $domain.streams.create(TOPIC);
        });

        it("creates an event", async () => {
            let event = await $domain.publishEvent(TOPIC, EVENT_DATA);

            $assertions.testObjectSchema(event, EVENT_SCHEMA);
        });

        it("creates a database record", async () => {
            let event = await $domain.publishEvent(TOPIC, EVENT_DATA);

            let result = await $db.findOneBy(TABLE_NAME(TOPIC), {
                id: event.seq
            });

            $mocha.expect(result.id).to.eq(event.seq);
            $mocha.expect(result.published_at).to.eq(event.published_at);
            $mocha.expect($json.parse(result.data)).to.deep.eq(event.data);
        });
    });

    describe("Scenario: without data", () => {
        const TOPIC = "publish_event_no_data_test";

        before(async () => {
            await $domain.streams.create(TOPIC);
        });

        it("creates a database record", async () => {
            let event = await $domain.publishEvent(TOPIC);

            let result = await $db.findOneBy(TABLE_NAME(TOPIC), {
                id: event.seq
            });

            $mocha.expect(result.id).to.eq(event.seq);
            $mocha.expect(result.published_at).to.eq(event.published_at);
            $mocha.expect($json.parse(result.data)).to.deep.eq(event.data);
        });
    });
});
