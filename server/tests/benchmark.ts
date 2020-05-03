import autocannon, { Options, Result } from "autocannon";
import yargs from "yargs";
import $logger from "@bahatron/logger";
import $env from "@bahatron/env";
import $json from "../utils/json";
import BIG_JSON from "./fixtures/big_json";

const MERCURIOS_TEST_URL = $env.get("TEST_URL");
const _topic = "benchmark_test";

$logger.inspect(yargs.argv);
let _duration = parseInt(yargs.argv.d as string) || 30;

function breakdown(result: Result) {
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

    $logger.info(`${title}`);

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

async function pingBench() {
    breakdown(
        await autocannon({
            title: "ping benchmark",
            connections: 100,
            pipelining: 10,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/ping`,
        })
    );
}

async function writeBench() {
    breakdown(
        await autocannon({
            title: `no data write benchmark`,
            connections: 100,
            pipelining: 10,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/publish/${_topic}`,
            method: "POST",
        })
    );
}

async function dataWriteBench() {
    let bigJson = $json.stringify(BIG_JSON);

    breakdown(
        await autocannon({
            title: "big json write benchmark",
            connections: 100,
            pipelining: 10,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/publish/${_topic}`,
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: bigJson,
        })
    );
}

async function readBench() {
    breakdown(
        await autocannon({
            title: "read benchmark",
            connections: 100,
            pipelining: 10,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/publish/${_topic}/1`,
        })
    );
}

async function competingWrites() {
    await Promise.all([
        autocannon({
            duration: _duration,
            title: "competing expected",
            url: `${MERCURIOS_TEST_URL}/publish/${_topic}`,
            method: "POST",
            connections: 100,
            pipelining: 10,
            body: $json.stringify({ expectedSeq: 1 }),
            headers: {
                "Content-Type": "application/json",
            },
        }),
        autocannon({
            duration: _duration,
            title: "competing expected without expected seq",
            url: `${MERCURIOS_TEST_URL}/publish/${_topic}`,
            method: "POST",
            connections: 100,
            pipelining: 10,
        }),
    ]).then((results) => results.map(breakdown));
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
}

main()
    .catch((err) => $logger.error(err))
    .finally(process.exit);
