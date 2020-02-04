import autocannon from "autocannon";
import $logger, { inspect } from "../services/logger";
import $createStream from "../domain/create_stream";
import $config from "../services/config";

const MERCURIOS_TEST_URL = $config.MERCURIOS_TEST_URL;
const TEST_TOPICS = ["benchmark_1", "benchmark_2", "benchmark_3"];

async function pingBench() {
    return autocannon({
        title: "ping benchmark",
        connections: 100,
        pipelining: 10,
        url: `${MERCURIOS_TEST_URL}/ping`,
    }).then(breakdown);
}

async function writeBench() {
    return Promise.all(
        TEST_TOPICS.map(async (topic: string) =>
            autocannon({
                title: `write benchmark`,
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${topic}`,
                method: "POST",
                body: "{}",
            })
        )
    ).then(breakdown);
}

async function readBench() {
    return Promise.all(
        TEST_TOPICS.map(async (topic: string) => {
            return autocannon({
                title: "read benchmark",
                connections: 100,
                pipelining: 10,
                url: `${MERCURIOS_TEST_URL}/stream/${topic}/1`,
            });
        })
    ).then(breakdown);
}

function breakdown(result: autocannon.Result | autocannon.Result[]) {
    function transform(result: autocannon.Result) {
        return {
            urL: result.url,
            title: result.title,
            average_requests: `${result.requests.average} req/sec`,
            average_latency: `${result.latency.average} ms`,
            average_throughput: `${result.throughput.average} bytes/sec`,
            errors: result.non2xx,
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

    $logger.info(`ping benchmark`);
    inspect(await pingBench());

    $logger.info(`write benchmark`);
    ((await writeBench()) as any[]).forEach(inspect);

    $logger.info(`read benchmark`);
    ((await readBench()) as any[]).forEach(inspect);
}

main()
    .catch(err => $logger.error(err))
    .finally(process.exit);
