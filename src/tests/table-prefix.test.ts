import { sleep } from "@bahatron/utils/lib/helpers";
import knex from "knex";
import MercuriosClient from "..";
import { EVENT_TABLE, TOPIC_TABLE } from "../store/driver";
import { $config } from "../utils/config";

describe(`Table Prefix Selection`, () => {
    const TEST_PREFIX = "testy_test";

    it(`will create tables with the selected prefix`, async () => {
        let pg = knex({
            client: "pg",
            connection: $config.test_url,
        });

        let client = MercuriosClient({
            url: $config.test_url,
            tablePrefix: TEST_PREFIX,
        });

        await sleep(500);

        expect(await pg.schema.hasTable(TOPIC_TABLE(TEST_PREFIX))).toBeTruthy();
        expect(await pg.schema.hasTable(EVENT_TABLE(TEST_PREFIX))).toBeTruthy();
    });
});
