import autocannon, { Options, Result } from "autocannon";
import yargs from "yargs";
import $logger from "@bahatron/logger";
import $env from "@bahatron/env";
import $json from "../utils/json";
import BIG_JSON from "./fixtures/big_json";
import $axios from "../utils/axios";

const MERCURIOS_TEST_URL = $env.get("TEST_URL");

$logger.inspect(yargs.argv);
let _duration = parseInt(yargs.argv.d as string) || 10;

function breakdown(result: Result | Result[]) {
    function logResult(result: Result) {
        let {
            title,
            requests,
            latency,
            throughput,
            errors,
            timeouts,
            duration,
            start,
            finish,
            connections,
            pipelining,
            non2xx,
        } = result;

        $logger.inspect({
            connections,
            pipelining,
            title,
            requests: {
                mean: requests.mean,
                stddev: requests.stddev,
                total: requests.total,
                p99: requests.p99,
            },

            latency: {
                mean: latency.mean,
                stddev: latency.stddev,
                max: latency.max,
                p99: latency.p99,
            },
            throughput: {
                mean: throughput.mean,
                stddev: throughput.stddev,
            },
            start,
            finish,
            duration,
            errors,
            non2xx,
            timeouts,
        });
    }

    if (Array.isArray(result)) {
        result.forEach(logResult);
    } else {
        logResult(result);
    }
}

async function pingBench() {
    $logger.info("ping benchmark");

    breakdown(
        await autocannon({
            title: "ping benchmark",
            connections: 100,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/ping`,
        })
    );
}

async function writeBench() {
    $logger.info("single topic with no data write benchmark");

    breakdown(
        await autocannon({
            title: `single with no data write benchmark`,
            connections: 100,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/publish/singleTopicBench`,
            method: "POST",
        })
    );
}

async function dataWriteBench() {
    $logger.info("big json benchmark");

    let bigJson = $json.stringify(BIG_JSON);
    breakdown(
        await autocannon({
            title: "big json write benchmark",
            connections: 100,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/publish/bigJsonBench`,
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: bigJson,
        })
    );
}

async function readBench() {
    $logger.info("read benchmark");

    let topic = "readBench";

    await $axios.post(`${MERCURIOS_TEST_URL}/publish/${topic}`, {
        data: {
            rick: "sanchez",
        },
    });

    breakdown(
        await autocannon({
            title: "read benchmark",
            connections: 100,

            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/read/${topic}/1`,
        })
    );
}

async function competingWrites() {
    $logger.info("competing writes benchmark");

    let topic = "competingBench";
    await Promise.all([
        autocannon({
            duration: _duration,
            title: "competing expected without expected seq",
            url: `${MERCURIOS_TEST_URL}/publish/${topic}`,
            method: "POST",
            connections: 100,
        }),
        autocannon({
            duration: _duration,
            title: "competing expected without expected seq",
            url: `${MERCURIOS_TEST_URL}/publish/${topic}`,
            method: "POST",
            connections: 100,
        }),
    ]).then(breakdown);
}

async function doubleStreams() {
    $logger.info("writes to two streams benchmark");

    await Promise.all([
        autocannon({
            duration: _duration,
            title: "competing expected without expected seq",
            url: `${MERCURIOS_TEST_URL}/publish/multiBench1`,
            method: "POST",
            connections: 100,
        }),
        autocannon({
            duration: _duration,
            title: "competing expected without expected seq",
            url: `${MERCURIOS_TEST_URL}/publish/multiBench2`,
            method: "POST",
            connections: 100,
        }),
    ]).then(breakdown);
}

async function main() {
    if (yargs.argv.write === true) {
        await writeBench();
    }

    if (yargs.argv.json === true) {
        await dataWriteBench();
    }

    if (yargs.argv.read === true) {
        await readBench();
    }

    if (yargs.argv.ping === true) {
        await pingBench();
    }

    if (yargs.argv.competing === true) {
        await competingWrites();
    }

    if (yargs.argv.multi === true) {
        await doubleStreams();
    }
}

main()
    .catch((err) => $logger.error(err))
    .finally(process.exit);
