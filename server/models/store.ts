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

async function transaction({
    expectedSeq,
    topic,
    published_at,
    data,
}: {
    expectedSeq: number;
    topic: string;
    published_at: string;
    data: any;
}): Promise<MercuriosEvent> {
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

            return $event({ topic, published_at, seq, data });
        });
    } catch (err) {
        if (err.name === "ExpectationFailed") {
            await $knex.raw(`ALTER TABLE ${table} auto_increment = 1`);
        }
        throw err;
    }
}

async function insert({
    topic,
    published_at,
    data,
}: MercuriosEvent): Promise<MercuriosEvent> {
    let table = tableName(topic);

    let seq = (
        await $knex(table).insert({
            published_at,
            data: $json.stringify(data),
        })
    ).shift();

    return $event({ topic, seq, published_at, data });
}

async function initTopic(topic: string): Promise<void> {
    try {
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
    } catch (err) {
        $logger.warning(`${err.message} - ${err.code}`);
        if (err.code === "ER_DUP_ENTRY") {
            return;
        }

        throw err;
    }
}

const $store = {
    async add({
        topic,
        published_at,
        data,
        expectedSeq,
    }: {
        topic: string;
        published_at: string;
        data: any;
        expectedSeq?: number;
    }): Promise<MercuriosEvent> {
        await initTopic(topic);

        return expectedSeq
            ? await transaction({ expectedSeq, topic, published_at, data })
            : await insert({ topic, published_at, data });
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
