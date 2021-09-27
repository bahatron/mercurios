import autocannon, { Options, Result } from "autocannon";
import yargs from "yargs";
import BIG_JSON from "../tests/big-json.fixture";
import { $json } from "../utils/json";
import { $config } from "../utils/config";
import { $logger } from "../utils/logger";
import { $axios } from "../utils/axios";
import { execute } from "@bahatron/utils/lib/helpers";

const MERCURIOS_TEST_URL = $config.test_url;

$logger.inspect(yargs.argv);
let _streams = parseInt(yargs.argv.s as string) || 10;
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

        console.log(`=`.repeat(80));
        $logger.inspect({
            title,
            connections,
            pipelining,
            requests: {
                mean: requests.mean,
                stddev: requests.stddev,
                max: requests.max,
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
    let body = $json.stringify({
        key: "test-key",
        data: {
            foo: "bar",
            rick: ["sanchez", "c-137"],
        },
    });

    breakdown(
        await autocannon({
            title: `publish to single topic`,
            connections: _connections,
            pipelining: _pipelining,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/publish/singleTopicBench`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body,
        })
    );
}

async function dataWriteBench() {
    let bigJson = $json.stringify({
        data: BIG_JSON,
    });

    breakdown(
        await autocannon({
            title: "publish 1mb json file",
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
    let topic = "readBench";

    await $axios.post(`${MERCURIOS_TEST_URL}/publish/${topic}`, {
        data: {
            rick: "sanchez",
        },
    });

    breakdown(
        await autocannon({
            title: "read to single topic with static sequence",
            connections: _connections,
            pipelining: _pipelining,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/read/${topic}/1`,
        })
    );
}

async function latestBench() {
    let topic = "latestBench";

    await $axios.post(`${MERCURIOS_TEST_URL}/publish/${topic}`, {
        data: {
            rick: "sanchez",
        },
    });

    breakdown(
        await autocannon({
            title: "read latest event in topic",
            connections: _connections,
            pipelining: _pipelining,
            duration: _duration,
            url: `${MERCURIOS_TEST_URL}/read/${topic}/latest`,
        })
    );
}

async function conflictiveWrites() {
    let topic = "conflictiveBench";
    await Promise.all([
        autocannon({
            duration: _duration,
            connections: _connections,
            pipelining: _pipelining,
            title: "publishing with expectedSeq = 1",
            url: `${MERCURIOS_TEST_URL}/publish/${topic}`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: $json.stringify({
                expectedSeq: 1,
                key: "conflictive writes",
            }),
        }),
        autocannon({
            duration: _duration,
            connections: _connections,
            pipelining: _pipelining,
            title: "publishing with no expectedSeq",
            url: `${MERCURIOS_TEST_URL}/publish/${topic}`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: $json.stringify({
                expectedSeq: 1,
                key: "conflictive writes",
            }),
        }),
    ]).then(breakdown);
}

async function multiStream(streams = _streams) {
    let body = $json.stringify({
        key: "test-key",
        data: {
            foo: "bar",
            rick: ["sanchez", "c-137"],
        },
    });

    let results = await Promise.all(
        Array(streams + 1)
            .fill(null)
            .map((val, index) => {
                return autocannon({
                    duration: _duration,
                    connections: _connections,
                    pipelining: _pipelining,
                    title: `concurrent publish to stream number: ${index}`,
                    url: `${MERCURIOS_TEST_URL}/publish/multiBench${index}`,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body,
                });
            })
    );

    let combined = results.reduce((combined, result: any) => {
        breakdown(result);
        for (let key in combined.requests) {
            (combined as any).requests[key] += result.requests[key];
        }

        return combined;
    }, results.shift() as Result);

    console.log(`=`.repeat(80));
    $logger.inspect({
        title: `combined multi stream benchmark results`,
        requests: {
            mean: combined.requests.mean,
        },
        latency: {
            mean: combined.latency.mean,
        },
        throughput: {
            mean: combined.throughput.mean,
        },
        errors: combined.errors,
    });
}

async function main() {
    $logger.info(`benchmark started - driver ${$config.store_driver}`);

    if (yargs.argv.write === true) {
        await writeBench();
    }

    if (yargs.argv.json === true) {
        await dataWriteBench();
    }

    if (yargs.argv.read === true) {
        await readBench();
    }

    if (yargs.argv.latest === true) {
        await latestBench();
    }

    if (yargs.argv.ping === true) {
        await pingBench();
    }

    if (yargs.argv.conflictive === true) {
        await conflictiveWrites();
    }

    if (yargs.argv.multi === true) {
        await multiStream();
    }
}

execute(main);
