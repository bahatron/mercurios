import $axios from "../src/services/axios";
import { EventEmitter } from "events";
import $streams from "../src/domain/modules/stream_repository";
import $env from "@bahatron/env";

const TOPIC = "sequential_test";
const TEST_API_URL = $env.get("TEST_API_URL", "http://localhost:3000");

async function createStream() {
    await $axios.post(`${TEST_API_URL}/streams`, {
        topic: TOPIC,
    });
}

async function initTest(observer) {
    let _continue = true;

    observer.on("stop", () => {
        _continue = false;
    });

    let counter = 1;

    while (_continue) {
        await $axios.post(`${TEST_API_URL}/stream/${TOPIC}`, {
            data: counter,
            expectedSeq: counter,
        });

        counter++;
    }

    return counter;
}

async function main() {
    console.log(`SEQUENTIAL INSERT BENCHMARK - started`);

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
        console.log(
            `SEQUENTIAL INSERT BENCHMARK - inserted ${result} records in 10s`
        );
    })
    .catch(err => {
        console.log(err);
    })
    .finally(process.exit);
