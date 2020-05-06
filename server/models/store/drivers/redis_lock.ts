import redis, { ClientOpts } from "redis";
import Redlock, { Lock, Options } from "redlock";
import $config from "../../../utils/config";
import $logger from "../../../utils/logger";
import $event, { MercuriosEvent } from "../../event";
import { EventStore, EventStoreFactory } from "../interfaces";
import knex, { Config } from "knex";
import $error from "../../../utils/error";
import $json from "../../../utils/json";

export default <EventStoreFactory>async function () {
    let { mysql, cache } = await initDriver();

    async function getNextSeq(
        topic: string,
        expectedSeq?: number
    ): Promise<number> {
        let lock = await cache.lock(`lock:${topic}`, 1000);

        let next = (parseInt(await cache.get(topic)) || 0) + 1;

        if (expectedSeq && next !== expectedSeq) {
            await lock.unlock();

            throw $error.ExpectationFailed(
                `expected seq ${expectedSeq} but got ${next}`
            );
        }

        await cache.set(topic, next);

        await lock.unlock();

        return next;
    }

    return {
        async add({ expectedSeq, topic, published_at, data }) {
            let seq = await getNextSeq(topic, expectedSeq);

            $logger.debug(`got a seq`, { topic, seq });

            let event = $event({ seq, topic, published_at, data });

            await Promise.all([
                mysql("mercurios_event_store").insert({
                    key: `${topic}_${seq}`,
                    event: $json.stringify(event),
                }),

                mysql.raw(`INSERT INTO mercurios_topics(topic, seq)
                VALUES("${topic}", "${seq}")
                ON DUPLICATE KEY UPDATE seq = "${seq}"`),
            ]);

            return event;
        },

        async fetch(
            topic: string,
            seq: number
        ): Promise<MercuriosEvent | null> {
            if (!(await cache.get(topic))) {
                throw $error.NotFound(`topic not found`);
            }

            let record = await mysql("mercurios_event_store")
                .where({ key: `${topic}_${seq}` })
                .first();

            return record?.event ?? null;
        },

        async deleteStream(topic: string) {
            await mysql("mercurios_event_store")
                .where("key", "like", `${topic}%`)
                .delete();

            await cache.delete(topic);
        },
    };
};

async function initDriver() {
    const _redis = redis.createClient(<ClientOpts>{
        host: $config.redis_host,
    });
    _redis.on("error", (err) => {
        throw err;
    });
    const _lock = new Redlock([_redis], {
        retryCount: 200,
        retryDelay: 10,
    });

    const cache = {
        async set(key: string, value: any) {
            return new Promise<true>((resolve, reject) => {
                _redis.set(key, $json.stringify(value), (err, result) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(true);
                });
            });
        },

        async get(key: string) {
            return new Promise<string>(async (resolve, reject) => {
                _redis.get(key, (err, value) => {
                    if (err) {
                        reject(err);
                    }

                    resolve($json.parse(value?.toString() || ""));
                });
            });
        },

        async delete(key: string) {
            return new Promise((resolve, reject) => {
                _redis.del(key, (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve();
                });
            });
        },

        lock: _lock.lock.bind(_lock),
    };

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

    const mysql = knex(config);

    try {
        await Promise.all([
            mysql.schema.createTable("mercurios_topics", (table) => {
                table.string("topic").unique();
                table.integer("seq");
            }),
            mysql.schema.createTable("mercurios_event_store", (table) => {
                table.string("key").primary().unique();
                table.json("event");
            }),
        ]);
    } catch (err) {
        switch (err.code) {
            case "ER_TABLE_EXISTS_ERROR":
                break;
            default:
                throw err;
        }
    }

    let topics = await mysql("mercurios_topics").select("topic", "seq");

    await Promise.all(
        topics.map((record) => {
            return cache.set(record.topic, record.seq);
        })
    );

    return {
        mysql,
        cache,
    };
}
