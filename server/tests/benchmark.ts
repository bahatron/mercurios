import autocannon, { Options, Result } from "autocannon";
import $logger from "@bahatron/logger";
import $env from "@bahatron/env";
import $json from "../services/json";
import BIG_JSON from "./fixtures/big_json";

const MERCURIOS_TEST_URL = $env.get("TEST_URL");
const _topic = "benchmark_test";

function breakdown(result: Result) {
    let {
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
    } = result;

    $logger.info(result.title || "");
    $logger.inspect({
        connections,
        pipelining,
        requests: {
            average: requests.average,
            mean: requests.mean,
            stddev: requests.stddev,
            min: requests.min,
            max: requests.max,
            sent: requests.sent,
            total: requests.total,
            p99: requests.p99,
        },

        latency: {
            average: latency.average,
            mean: latency.mean,
            stddev: latency.stddev,
            min: latency.min,
            max: latency.max,
            p99: latency.p99,
        },
        throughput: {
            average: throughput.average,
            mean: throughput.mean,
            stddev: throughput.stddev,
            max: throughput.max,
            min: throughput.min,
            total: throughput.total,
            p99: throughput.p99,
        },
        start,
        finish,
        duration,
        errors,
        timeouts,
    });
}

async function pingBench() {
    breakdown(
        await autocannon({
            title: "ping benchmark",
            connections: 100,
            pipelining: 10,
            duration: 30,
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
            duration: 30,
            url: `${MERCURIOS_TEST_URL}/stream/${_topic}`,
            method: "POST",
        })
    );
}

async function dataWriteBench() {
    let bigJson = $json.stringify(BIG_JSON);

    breakdown(
        await autocannon({
            title: `big json write benchmark`,
            connections: 100,
            pipelining: 10,
            duration: 30,
            url: `${MERCURIOS_TEST_URL}/stream/${_topic}`,
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
            duration: 30,
            url: `${MERCURIOS_TEST_URL}/stream/${_topic}/1`,
        })
    );
}

async function main() {
    await pingBench();
    await writeBench();
    await dataWriteBench();
    await readBench();
}

main()
    .catch((err) => $logger.error(err))
    .finally(process.exit);
