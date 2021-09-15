import { MercuriosEvent } from "../models/event";
import { $logger } from "../utils/logger";
import { StoreDriver } from "./store.interfaces";
import { PostgresStore } from "./drivers/postgres/postgres.store";

const { POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_USER, POSTGRES_HOST } =
    process.env;

const POSTGRES_STORE_URL = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}`;

describe("MercuriosStore: Postgres Driver", () => {
    let postgresDriver: StoreDriver;

    beforeAll(async () => {
        postgresDriver = await PostgresStore({
            url: POSTGRES_STORE_URL,
        });

        $logger.debug(`postgres driver started`);
    });

    it(`can append`, async () => {
        try {
            let event = {
                topic: "testytopic",
                key: "keyo",
                timestamp: new Date().toISOString(),
                data: [
                    {
                        rick: "sanchez",
                    },
                ],
            };

            let result = await postgresDriver.append(event);

            expect(result.timestamp).toEqual(event.timestamp);
        } catch (err) {
            $logger.error(err);
        }
    });
});
