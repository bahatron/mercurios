import $knex from "../utils/knex";
import { MigratorConfig } from "knex";
import $logger from "../utils/logger";

$logger.on("error", $logger.inspect);
$knex.migrate
    .latest(<MigratorConfig>{})
    .then(() => {
        $logger.info("migration complete");
        process.exit(0);
    })
    .catch((err) => {
        $logger.error(err);
        process.exit(-1);
    });
