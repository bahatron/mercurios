import autocannon from "autocannon";
import $logger from "../services/logger";
import $env from "@bahatron/env";
import $createStream from "../domain/create_stream";

const TEST_SERVER_URL = $env.get("TEST_SERVER_URL");
const TEST_TOPICS = ["benchmark_1", "benchmark_2", "benchmark_3"];

async function pingBench() {
    return autocannon({
        connections: 100,
        pipelining: 10,
        url: `${TEST_SERVER_URL}/ping`,
    });
}

async function writeBench() {
    return Promise.all(
        TEST_TOPICS.map(async (topic: string) =>
            autocannon({
                title: `write benchmark`,
                connections: 100,
                pipelining: 10,
                url: `${TEST_SERVER_URL}/stream/${topic}`,
                method: "POST",
                body: "{}",
            })
        )
    );
}

async function readBench() {
    return Promise.all(
        TEST_TOPICS.map(async (topic: string) => {
            return autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${TEST_SERVER_URL}/stream/${topic}/1`,
            });
        })
    );
}

function breakdown(result: autocannon.Result | autocannon.Result[]) {
    function readResult(result: autocannon.Result) {
        return {
            urL: result.url,
            average_requests: `${result.requests.average} req/sec`,
            average_latency: `${result.latency.average} ms`,
            average_throughput: `${result.throughput.average} bytes/sec`,
            errors: result.non2xx,
        };
    }

    /** @todo: aggregate results */
    if (Array.isArray(result)) {
        return result.map(readResult);
    }

    return readResult(result);
}

async function main() {
    await Promise.all(TEST_TOPICS.map(topic => $createStream(topic)));

    $logger.debug(`ping benchmark`, breakdown(await pingBench()));
    $logger.debug(`write benchmark`, breakdown(await writeBench()));
    $logger.debug(`read benchmark`, breakdown(await readBench()));
}

main()
    .catch(err => $logger.error(err))
    .finally(process.exit);
