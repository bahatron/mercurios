import $http from "../services/http";
import { EventEmitter } from "events";
import $streams from "../domain/modules/stream_repository";
import $env from "@bahatron/env";
import $logger from "../services/logger";

const TOPIC = "sequential_test";
const TEST_SERVER_URL = $env.get("TEST_SERVER_URL", "http://localhost:3000");

async function createStream() {
    await $http.post(`${TEST_SERVER_URL}/streams`, {
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
        await $http.post(`${TEST_SERVER_URL}/stream/${TOPIC}`, {
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
