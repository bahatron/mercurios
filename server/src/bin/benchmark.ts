import autocannon, { Options, Result } from "autocannon";
import yargs from "yargs";
import $logger from "@bahatron/logger";
import $env from "@bahatron/env";
import BIG_JSON from "../tests/fixtures/big_json";
import $json from "../utils/json";
import $axios from "../utils/axios";

const MERCURIOS_TEST_URL = $env.get("TEST_URL");

$logger.inspect(yargs.argv);
let _duration = parseInt(yargs.argv.d as string) || 10;
let _connections = parseInt(yargs.argv.c as string) || 100;
let _pipelining = parseInt(yargs.argv.p as string) || 1;

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
            connections: _connections,
            pipelining: _pipelining,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/ping`,
        })
    );
}

async function writeBench() {
    $logger.info("write single topic with no data write benchmark");

    breakdown(
        await autocannon({
            title: `single with no data write benchmark`,
            connections: _connections,
            pipelining: _pipelining,
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
            connections: _connections,
            pipelining: _pipelining,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/publish/bigJsonBench`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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
            connections: _connections,
            pipelining: _pipelining,
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
            connections: _connections,
            pipelining: _pipelining,
            title: "competing expected with expected seq",
            url: `${MERCURIOS_TEST_URL}/publish/${topic}`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: $json.stringify({
                expectedSeq: 1,
            }),
        }),
        autocannon({
            duration: _duration,
            connections: _connections,
            pipelining: _pipelining,
            title: "competing expected without expected seq",
            url: `${MERCURIOS_TEST_URL}/publish/${topic}`,
            method: "POST",
        }),
    ]).then(breakdown);
}

async function multiStream(amount = 10) {
    $logger.info("multiple streams write benchmark");

    await Promise.all(
        Array(amount)
            .fill(null)
            .map((val, index) => {
                return autocannon({
                    duration: _duration,
                    connections: _connections,
                    pipelining: _pipelining,
                    title: `multiple streams write benchmark - stream ${index}`,
                    url: `${MERCURIOS_TEST_URL}/publish/multiBench${index}`,
                    method: "POST",
                });
            })
    ).then(breakdown);
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
        await multiStream();
    }
}

main()
    .catch((err) => $logger.error(err))
    .finally(process.exit);
