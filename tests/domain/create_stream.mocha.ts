import $stream from "../../src/domain";
import $db from "../../src/services/db";
import $mocha from "../settings.mocha";
import $json from "../../src/services/json";
import { TABLE_NAME } from "../../src/domain/streams/stream_factory";
import { STREAM_DEFINITIONS } from "../../src/domain/streams/stream_repository";

describe("Create stream", () => {
    const TOPIC = "create_stream_test";

    describe("Scenario: with no schema", () => {
        before(async () => {
            await $db.truncate(STREAM_DEFINITIONS);

            await $stream.streams.create(TOPIC);
        });

        it("creates a stream table", async () => {
            $mocha.expect(await $db.hasTable(TABLE_NAME(TOPIC))).to.be.true;
        });

        it("creates a stream record", async () => {
            let result = await $db.findOneBy(STREAM_DEFINITIONS, {
                topic: TOPIC
            });

            $mocha.expect(Boolean(result)).to.be.true;

            let { topic, schema }: any = result;

            $mocha.expect(topic).to.eq(TOPIC);
            $mocha.expect($json.parse(schema)).to.eq(null);
        });
    });
});
