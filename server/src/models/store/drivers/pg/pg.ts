import Knex, { Config } from "knex";
import $config from "../../../../utils/config";
import $logger from "../../../../utils/logger";
import { EventStore, CreateParams } from "../../interfaces";
import $event, { MercuriosEvent } from "../../../event";
import $json from "../../../../utils/json";
import $nats from "../../../../utils/nats";
import $error, { ERROR_CODES } from "../../../../utils/error";
import $pg from "../../../../utils/postgres";

const EVENT_TABLE = "mercurios_events";
const TOPIC_TABLE = "mercurios_topics";
const PROCEDURE = "store_event";

export default async () => {
    let _pg = await connect();
    let _streams: Record<string, Stream> = {};

    $nats.subscribe("mercurios_stream_deleted", (err, msg) => {
        delete _streams[msg.data];
    });

    $nats.subscribe("mercurios_streams_created", (err, msg) => {
        let topic = msg.data;
        if (!_streams[topic]) {
            _streams[topic] = Stream(_pg, topic);
        }
    });

    async function createStream(topic: string) {
        try {
            // await _pg.raw(
            //     `INSERT INTO ${TOPIC_TABLE}(topic, seq) VALUES('${topic}', 0)`
            // );
            await _pg.table(TOPIC_TABLE).insert({ topic, seq: 0 });

            await $nats.publish("mercurios_stream_created", topic);

            return Stream(_pg, topic);
        } catch (err) {
            if ((err.message as string).includes("duplicate key value")) {
                return Stream(_pg, topic);
            }

            throw err;
        }
    }

    async function fetchStream(topic: string): Promise<Stream | null> {
        if (_streams[topic]) {
            return _streams[topic];
        }

        if (await _pg(TOPIC_TABLE).where({ topic }).first()) {
            _streams[topic] = Stream(_pg, topic);
            return _streams[topic];
        }

        return null;
    }

    async function removeStream(topic: string) {
        await $nats.publish("mercurios_stream_deleted", topic);
        delete _streams[topic];
    }

    return <EventStore>{
        async add({ expectedSeq, topic, data, published_at }) {
            let stream =
                (await fetchStream(topic)) || (await createStream(topic));

            return stream.store({ expectedSeq, topic, data, published_at });
        },

        async fetch(topic, seq) {
            let stream = await fetchStream(topic);

            if (!stream) {
                throw $error.NotFound(`Stream for topic: ${topic} not found`, {
                    code: ERROR_CODES.STREAM_NOT_FOUND,
                });
            }

            return stream.read(seq);
        },

        async deleteStream(topic) {
            await Promise.all([
                _pg(TOPIC_TABLE).where({ topic }).delete(),
                _pg(EVENT_TABLE).where({ topic }).delete(),
                removeStream(topic),
            ]);
        },

        async streamExists(topic) {
            return Boolean(await fetchStream(topic));
        },
    };
};

type Stream = ReturnType<typeof Stream>;
function Stream(_pg: Knex, _topic: string) {
    async function transaction(params: CreateParams) {
        let { topic, published_at, data, expectedSeq } = params;

        return await _pg.transaction(async (trx) => {
            let nextSeq =
                (
                    await trx(TOPIC_TABLE)
                        .select("seq")
                        .where({ topic })
                        .forUpdate()
                ).shift().seq + 1;

            if (nextSeq === null) {
                throw new Error("ERR_NO_STREAM");
            } else if (expectedSeq && expectedSeq !== nextSeq) {
                throw new Error("ERR_CONFLICT");
            }

            let [update, insert] = await Promise.all([
                trx(TOPIC_TABLE).update({ seq: nextSeq }).where({ topic }),
                trx(EVENT_TABLE)
                    .insert({
                        topic,
                        seq: nextSeq,
                        published_at,
                        data: $json.stringify(data),
                    })
                    .returning("*"),
            ]);

            return insert.shift();
        });
    }

    return {
        async store(params: CreateParams): Promise<MercuriosEvent> {
            let { published_at, data, expectedSeq } = params;
            try {
                let parsedData = $json.stringify(data) || "{}";

                let result = await _pg.raw(`call ${PROCEDURE}(?, ?, ?, ?)`, [
                    _topic,
                    (expectedSeq || null) as any,
                    published_at,
                    parsedData,
                ]);

                let resultData = result.rows.shift();

                return $event({
                    topic: resultData.v_topic,
                    seq: resultData.v_seq,
                    published_at: resultData.v_published_at,
                    data: resultData.v_data,
                });

                // return $event(await testTransaction(params));
            } catch (err) {
                if ((err.message as string).includes("ERR_CONFLICT")) {
                    throw $error.ExpectationFailed(
                        "Conflict with expected sequence",
                        {
                            code: "ERR_CONFLICT",
                        }
                    );
                } else if ((err.message as string).includes("ERR_NO_STREAM")) {
                    await $nats.publish("mercurios_stream_deleted", _topic);
                    throw $error.NotFound(`Stream for ${_topic} not found`);
                }

                throw err;
            }
        },

        async read(seq: number): Promise<MercuriosEvent | null> {
            let result = await _pg(EVENT_TABLE)
                .where({ topic: _topic, seq })
                .first();

            if (!result) {
                return null;
            }

            return $event(result);
        },
    };
}

async function connect() {
    return $pg;
}
