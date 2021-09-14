import { MercuriosEvent } from "../../../models/event";
import { $logger } from "../../../utils/logger";
import { StoreDriver } from "../../store.interfaces";
import { PostgresStore } from "./postgres.store";

describe("MercuriosStore: Postgres Driver", () => {
    let postgresDriver: StoreDriver;

    beforeAll(async () => {
        postgresDriver = await PostgresStore({
            url:
                process.env.POSTGRES_STORE_URL ||
                `postgres://admin:secret@localhost:5432/mercurios`,
        });

        $logger.debug(`postgres driver started`);
    });

    it(`can append`, async () => {
        let event = await postgresDriver.append(
            MercuriosEvent({
                topic: "testytopic",
                key: "keyo",
                data: {
                    rick: "sanchez",
                },
            })
        );

        $logger.info(event, "event");
    });
});
