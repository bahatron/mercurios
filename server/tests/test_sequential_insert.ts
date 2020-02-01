import $axios from "../services/axios";
import { EventEmitter } from "events";
import $streams from "../domain/modules/stream_repository";
import $logger from "../services/logger";
import $config from "../services/config";

const TOPIC = "sequential_test";

const MERCURIOS_TEST_URL = $config.MERCURIOS_TEST_URL;

async function createStream() {
    await $axios.post(`${MERCURIOS_TEST_URL}/streams`, {
        topic: TOPIC,
    });
}

async function initTest(observer: EventEmitter) {
    let _continue = true;

    observer.on("stop", () => {
        _continue = false;
    });

    let counter = 1;

    while (_continue) {
        await $axios.post(`${MERCURIOS_TEST_URL}/stream/${TOPIC}`, {
            data: counter,
            expectedSeq: counter,
        });

        counter++;
    }

    return counter;
}

async function main() {
    $logger.info(`SEQUENTIAL INSERT TEST - started`);

    await $streams.delete(TOPIC);

    await createStream();

    const _obs = new EventEmitter();

    setTimeout(() => {
        _obs.emit("stop");
    }, 10000);

    return initTest(_obs);
}

main()
    .then(result => {
        $logger.info(`SEQUENTIAL INSERT TEST - ${result} records in 10s`);
    })
    .catch(err => {
        $logger.error(err.message, err);
    })
    .finally(process.exit);
