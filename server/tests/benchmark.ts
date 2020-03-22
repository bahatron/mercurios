import autocannon from "autocannon";
import $logger from "@bahatron/logger";
import $env from "@bahatron/env";
import $json from "../services/json";
import BIG_JSON from "./fixtures/big_json";

const MERCURIOS_TEST_URL = $env.get("TEST_URL");
const _topic = "benchmark_test";

async function pingBench() {
    breakdown(
        "ping test",
        await autocannon({
            title: "ping benchmark",
            connections: 100,
            pipelining: 10,
            url: `${MERCURIOS_TEST_URL}/ping`,
        })
    );
}

async function writeBench() {
    breakdown(
        "single stream write - no data",
        await autocannon({
            title: `with data write benchmark`,
            connections: 100,
            pipelining: 10,
            url: `${MERCURIOS_TEST_URL}/stream/${_topic}`,
            method: "POST",
        })
    );
}

async function dataWriteBench() {
    let bigJson = $json.stringify(BIG_JSON);

    breakdown(
        "single stream write",
        await autocannon({
            title: `write benchmark`,
            connections: 100,
            pipelining: 10,
            url: `${MERCURIOS_TEST_URL}/stream/${_topic}`,
            method: "POST",
            body: bigJson,
        })
    );
}

async function readBench() {
    breakdown(
        "single stream read benchmark",
        await Promise.all([
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/1`,
            }),
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/2`,
            }),
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/3`,
            }),
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/4`,
            }),
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/5`,
            }),
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/6`,
            }),
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/7`,
            }),
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/8`,
            }),
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/9`,
            }),
            autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${_topic}/10`,
            }),
        ])
    );
}

function breakdown(
    message: string,
    result: autocannon.Result | autocannon.Result[]
) {
    function transform(result: autocannon.Result) {
        return {
            urL: result.url,
            title: result.title,
            request_average: `${result.requests.average} req/sec`,
            latency_average: `${result.latency.average} ms`,
            throughput_average: `${result.throughput.average} bytes/sec`,
            errors: result.non2xx,
            connections: result.connections,
            pipelining: result.pipelining,
        };
    }

    if (Array.isArray(result)) {
        return $logger.info(message, result.map(transform));
    }

    $logger.info(message, transform(result));
}

async function main() {
    await pingBench();

    await writeBench();

    await dataWriteBench();

    await readBench();
}

main()
    .catch(err => $logger.error(err))
    .finally(process.exit);
