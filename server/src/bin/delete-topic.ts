import { execute } from "@bahatron/utils/lib/helpers";
import { $store } from "../store/store";
import { $logger } from "../utils/logger";

execute(async () => {
    const topic = process.argv.slice(2).shift();

    if (!topic) {
        $logger.warning(`no topic specified`);
        process.exit(-1);
    }

    await $store.deleteStream(topic);

    $logger.info({ topic }, `topic deleted`);
});
