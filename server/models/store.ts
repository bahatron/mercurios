import $event, { MercuriosEvent } from "./event";
import $knex from "../utils/knex";
import $logger from "../utils/logger";
import $json from "../utils/json";
import $error from "../utils/error";

const TOPIC_COLLECTION = "mercurios_topics";

const _topics: Set<string> = new Set();

function tableName(topic: string): string {
    return `stream_${topic}`;
}
async function transaction(
    event: MercuriosEvent,
    expectedSeq: number
): Promise<number> {
    let { published_at, data, topic } = event;
    let table = tableName(topic);
    try {
        return await $knex.transaction(async (_trx) => {
            let seq = (
                await _trx(table).insert({
                    published_at,
                    data: $json.stringify(data),
                })
            ).shift();

            if (!seq) {
                throw $error.InternalError(`unexpected response from store`);
            }

            if (expectedSeq !== seq) {
                throw $error.ExpectationFailed(
                    `error writing to stream - expected seq ${expectedSeq} but got ${seq}`
                );
            }

            return seq;
        });
    } catch (err) {
        if (err.name === "ExpectationFailed") {
            await $knex.raw(`ALTER TABLE ${table} auto_increment = 1`);
        }
        throw err;
    }
}

async function insert(event: MercuriosEvent): Promise<number> {
    let { topic, published_at, data } = event;
    let table = tableName(topic);

    return await $knex(table).insert({
        published_at,
        data: $json.stringify(data),
    });
}

async function fetchOrCreateTopic(topic: string): Promise<void> {
    if (_topics.has(topic)) {
        return;
    }

    let record = await $knex(TOPIC_COLLECTION).where({ topic }).first();

    if (!record) {
        await $knex(TOPIC_COLLECTION).insert({ topic });
        await $knex.schema.createTable(`stream_${topic}`, (table) => {
            table.increments("seq").primary();
            table.string("published_at");
            table.text("data", "longtext");
        });
    }

    return;
}

const $store = {
    async add(
        event: MercuriosEvent,
        expectedSeq?: number
    ): Promise<MercuriosEvent> {
        await fetchOrCreateTopic(event.topic);

        let seq = expectedSeq
            ? await transaction(event, expectedSeq)
            : await insert(event);

        return $event({
            seq,
            data: event.data,
            topic: event.topic,
            published_at: event.published_at,
        });
    },

    async fetch(topic: string, seq: number): Promise<MercuriosEvent | null> {
        try {
            let result = await $knex(tableName(topic))
                .where({
                    seq,
                })
                .first();

            if (!result) {
                return null;
            }

            let { published_at, data } = result;

            return $event({
                published_at,
                data: $json.parse(data),
                seq,
                topic,
            });
        } catch (err) {
            if (err.code === "ER_NO_SUCH_TABLE") {
                throw $error.NotFound(`topic ${topic} not found`);
            }

            throw err;
        }
    },
};

export default $store;
