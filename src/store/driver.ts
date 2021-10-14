import { Logger } from "@bahatron/utils/lib/logger";
import Knex from "knex";
import { $logger } from "../utils/logger";
import { STORE_VALUES } from "./static";

export function PostgresClient({
    url,
    logger,
}: {
    url: string;
    logger: Logger;
}) {
    let listening: boolean;

    return Knex({
        client: "pg",
        connection: url,
        pool: {
            min: 2,
            max: 20,
            propagateCreateError: false,
            afterCreate: (connection, done) => {
                if (listening) {
                    done(null, connection);
                    return;
                }
                listening = true;
                connection.query(
                    `LISTEN ${STORE_VALUES.NOTIFICATION_CHANNEL}`,
                    function (err) {
                        if (err) {
                            listening = false;
                        } else {
                            connection.on("notification", (msg) => {
                                $logger.debug(msg, "got notification");
                            });
                            connection.on("end", () => {
                                listening = false;
                            });

                            connection.on("error", (err) => {
                                logger.warning(
                                    err,
                                    "error on mercurios notification"
                                );
                            });
                        }
                        done(err, connection);
                    }
                );
            },
        },
    });
}
