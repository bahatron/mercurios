import $logger from "../utils/logger";

$logger.on("debug", (context) => $logger.inspect(context));

after(() => setTimeout(process.exit, 100));
