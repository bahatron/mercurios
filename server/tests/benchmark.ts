import autocannon from "autocannon";
import $logger from "../services/logger";
import $createStream from "../domain/create_stream";
import $config from "../services/config";

const MERCURIOS_TEST_URL = $config.test_url;
const TEST_TOPICS = ["benchmark_1", "benchmark_2", "benchmark_3"];

async function pingBench() {
    $logger.info(`ping benchmark`);

    let result = await autocannon({
        title: "ping benchmark",
        connections: 100,
        pipelining: 10,
        url: `${MERCURIOS_TEST_URL}/ping`,
    }).then(breakdown);

    $logger.info("ping benchmark complete");
    $logger.inspect(result);
}

async function writeBench() {
    let test = async (topic: string) => {
        return autocannon({
            title: `write benchmark`,
            connections: 100,
            pipelining: 10,
            url: `${MERCURIOS_TEST_URL}/stream/${topic}`,
            method: "POST",
            body: "{}",
        });
    };

    $logger.info(`single stream write benchmark`);

    $logger.info(`single stream write benchmark complete`);
    $logger.inspect(
        await test("benchmark_1").then(result => breakdown(result))
    );
}

async function readBench() {
    let test = async (topic: string) => {
        return autocannon({
            title: "read benchmark",
            connections: 100,
            pipelining: 10,
            url: `${MERCURIOS_TEST_URL}/stream/${topic}/1`,
        });
    };

    $logger.info(`single stream read benchmark...`);

    $logger.info(`single stream read benchmark complete`);
    $logger.inspect(
        await test("benchmark_1").then(result => breakdown(result))
    );
}

function breakdown(result: autocannon.Result | autocannon.Result[]) {
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

    /** @todo: aggregate results */
    if (Array.isArray(result)) {
        return result.map(transform);
    }

    return transform(result);
}

async function main() {
    await Promise.all(TEST_TOPICS.map(topic => $createStream(topic)));

    await pingBench();

    await writeBench();

    await readBench();
}

main()
    .catch(err => $logger.error(err))
    .finally(process.exit);
