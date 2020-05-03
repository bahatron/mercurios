import { EventStoreFactory, CreateParams, EventStore } from "../interfaces";
import knex, { Config } from "knex";
import $config from "../../../utils/config";
import $json from "../../../utils/json";
import $error from "../../../utils/error";
import $nats from "../../../utils/nats";
import $event from "../../event";
import $logger from "../../../utils/logger";
import { read } from "fs";

export default <EventStoreFactory>async function () {
    // export default async function () {
    let driver = await connection();

    let _streams: Record<string, ReturnType<typeof Stream>> = {};

    $nats.subscribe("mercurios_stream_deleted", (err, msg) => {
        delete _streams[msg.data];

        $logger.debug(`stream dropped from cache`, { topic: msg.data });
    });

    $nats.subscribe("mercurios_stream_created", (err, msg) => {
        if (!_streams[msg.data]) {
            _streams[msg.data] = Stream({ topic: msg.data, driver });
            $logger.debug(`stream cached`, { topic: msg.data });
        }
    });

    async function fetchStream(topic: string) {
        if (_streams[topic]) {
            return _streams[topic];
        }

        if (await driver.schema.hasTable(tableName(topic))) {
            _streams[topic] = Stream({ topic, driver });

            return _streams[topic];
        }
    }

    async function createStream(topic: string) {
        _streams[topic] = Stream({ topic, driver });

        return _streams[topic];
    }

    return {
        async add({ expectedSeq, topic, data, published_at }: CreateParams) {
            try {
                let stream =
                    (await fetchStream(topic)) ?? (await createStream(topic));

                let seq = expectedSeq
                    ? await stream.appendExpectedSeq({
                          topic,
                          expectedSeq,
                          data,
                          published_at,
                      })
                    : await stream.append({
                          expectedSeq,
                          topic,
                          data,
                          published_at,
                      });

                if (!seq) {
                    throw $error.InternalError(
                        `Unexpected response from MySQL`,
                        {
                            code: "NO_SEQ_RETURNED",
                            seq,
                        }
                    );
                }

                return $event({ seq, topic, published_at, data });
            } catch (err) {
                throw err;
            }
        },

        async fetch(topic: string, seq: number) {
            try {
                let stream = await fetchStream(topic);

                if (!stream) {
                    $logger.debug("no stream found", { topic });
                    throw $error.NotFound(
                        `Stream for topic: ${topic} not found`,
                        {
                            // todo: standarise this codes
                            code: "ERR_NOSTREAM",
                        }
                    );
                }

                let result = await stream.read(seq);

                if (!result) {
                    $logger.debug("NO RESULT");
                    return null;
                }

                let { published_at, data } = result;
                return $event({
                    published_at,
                    data: $json.parse(data),
                    topic,
                    seq,
                });
            } catch (err) {
                throw err;
            }
        },

        async deleteStream(topic: string) {
            await Promise.all([
                driver.schema.dropTableIfExists(tableName(topic)),
                driver("mercurios_topics").where({ topic }).delete(),
            ]);

            delete _streams[topic];

            await $nats.publish("mercurios_stream_deleted", topic);
        },
    };
};

async function Stream({ driver, topic }: { topic: string; driver: knex }) {
    let table = tableName(topic);

    try {
        await Promise.all([
            await driver.schema.createTable(table, (dbTable) => {
                dbTable.increments("seq").primary();
                dbTable.string("published_at");
                dbTable.text("data", "longtext");
            }),
            await driver("mercurios_topics").insert({ topic }),
        ]);

        await $nats.publish("mercurios_stream_created", topic);
    } catch (err) {
        switch (err.code) {
            case "ER_TABLE_EXISTS_ERROR":
                break;
            default:
                throw err;
        }
    }

    return {
        async append({ data, published_at }: CreateParams) {
            return (
                await driver(table).insert({
                    published_at,
                    data: $json.stringify(data),
                })
            ).shift();
        },

        async appendExpectedSeq({
            data,
            published_at,
            expectedSeq,
        }: CreateParams) {
            try {
                return await driver.transaction(async (_trx) => {
                    let seq = (
                        await _trx(table).insert({
                            published_at,
                            data: $json.stringify(data),
                        })
                    ).shift();

                    if (expectedSeq !== seq) {
                        throw $error.ExpectationFailed(
                            `expected seq ${expectedSeq} but got ${seq}`,
                            {
                                code: "ERR_SEQ_CONFLICT",
                            }
                        );
                    }

                    return seq;
                });
            } catch (err) {
                if (err.name === "ExpectationFailed") {
                    await driver.raw(`ALTER TABLE ${table} auto_increment = 1`);
                }
                throw err;
            }
        },

        async read(seq: number) {
            return driver(table).where({ seq }).first();
        },
    };
}

const tableName = (topic: string) => `stream_${topic}`;

async function connection() {
    const config: Config = {
        client: "mysql2",
        connection: {
            host: $config.mysql_host,
            port: $config.mysql_port,
            user: $config.mysql_user,
            password: $config.mysql_password,
            database: $config.mysql_database,
        },
    };

    const driver = knex(config);

    if (!(await driver.schema.hasTable("mercurios_topics"))) {
        try {
            await driver.schema.createTable("mercurios_topics", (table) => {
                table.string("topic").unique();
            });
            $logger.debug("multitable driver initialized");
        } catch (err) {
            switch (err.code) {
                case "ER_TABLE_EXISTS_ERROR":
                    break;
                default:
                    throw err;
            }
        }
    }

    return driver;
}
