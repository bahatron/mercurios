import $domain from "../../src/domain";
import { Event } from "../../src/domain/events/event_factory";
import $mocha from "../settings.mocha";

describe("Read event", () => {
    const TOPIC = "read_event_behaviour_test";

    const EVENT_DATA = {
        foo: "bar"
    };

    describe("Scenario: existing event", () => {
        let EVENT: Event;
        before(async () => {
            await $domain.streams.create(TOPIC);
            let result = await $domain.publishEvent(TOPIC, EVENT_DATA);

            EVENT = (await $domain.readEvent(TOPIC, result.seq)) as Event;
        });

        it("returns the expected event", async () => {
            $mocha.expect(Boolean(EVENT)).to.be.true;

            $mocha.expect(EVENT.data).to.deep.eq(EVENT_DATA);
        });
    });
});
