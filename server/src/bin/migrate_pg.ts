import $pg from "../utils/postgres";
import $logger from "../utils/logger";

$pg.migrate
    .latest()
    .then(() => $logger.info("pg migrations completed"))
    .catch((err) => $logger.error(err.message, err))
    .finally(process.exit);
