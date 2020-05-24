import Knex, { Config } from "knex";
import $config from "../../../utils/config";
import $logger from "../../../utils/logger";
import { EventStore, CreateParams } from "../interfaces";
import $event, { MercuriosEvent } from "../../event";
import $json from "../../../utils/json";
import { read } from "fs";
import $nats from "../../../utils/nats";
import $error, { ERROR_CODES } from "../../../utils/error";

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
            await _pg.raw(
                `INSERT INTO ${TOPIC_TABLE}(topic, seq) VALUES('${topic}', 0)`
            );

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
            _streams[topic] = await createStream(topic);
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
    return {
        async store({
            published_at,
            data,
            expectedSeq,
        }: CreateParams): Promise<MercuriosEvent> {
            try {
                let parsedData = $json.stringify(data) || "{}";

                let result = await _pg.raw(
                    `call ${PROCEDURE}('${_topic}', ${
                        expectedSeq || null
                    }, '${published_at}', '${parsedData}')`
                );

                $logger.debug(`result from pg procedure`, result.rows);

                let resultData = result.rows.shift();

                return $event({
                    topic: resultData.v_topic,
                    seq: resultData.v_seq,
                    published_at: resultData.v_published_at,
                    data: resultData.v_data,
                });
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
    const config: Config = {
        client: "pg",
        connection: {
            host: $config.postgre_host,
            port: parseInt($config.postgre_port),
            user: $config.postgre_user,
            password: $config.postgre_password,
            database: $config.postgre_database,
        },
    };

    let pg = Knex(config);

    await Promise.all([
        pg.raw(`
        CREATE TABLE IF NOT EXISTS ${TOPIC_TABLE} (
            topic varchar(255),
            seq integer,
            PRIMARY KEY (topic)
          );
        `),

        pg.raw(`
        CREATE TABLE IF NOT EXISTS ${EVENT_TABLE} (
            topic varchar(255),
            seq integer,
            published_at varchar(30),
            data text,
            PRIMARY KEY (topic, seq)
          );
        `),
    ]);

    await pg.raw(`
        CREATE OR REPLACE PROCEDURE ${PROCEDURE} (
            inout v_topic varchar(255), 
            inout v_seq integer, 
            inout v_published_at varchar(30), 
            inout v_data text
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            next_seq integer;
            record mercurios_events;
        BEGIN
            next_seq := (
                SELECT
                    seq
                FROM
                    mercurios_topics
                WHERE
                    topic = v_topic
                FOR UPDATE) + 1;

            IF (next_seq IS NULL) THEN
                RAISE 'ERR_NO_STREAM';
            END IF;

            IF v_seq IS NOT NULL AND next_seq != v_seq THEN
                RAISE 'ERR_CONFLICT';
            END IF;

            UPDATE
                    mercurios_topics
                SET
                    seq = next_seq
                WHERE
                    topic = v_topic;

            INSERT INTO mercurios_events (topic, seq, published_at, data)
                VALUES (v_topic, next_seq, v_published_at, v_data) 
                returning seq into v_seq;
            COMMIT;
        END;
        $$;
    `);

    $logger.info("pg driver initialized");

    return pg;
}
