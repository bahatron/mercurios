import knex, { Config } from "knex";
import $config from "../../../utils/config";
import { EventStoreFactory, CreateParams, EventStore } from "../interfaces";
import $json from "../../../utils/json";
import $logger from "../../../utils/logger";
import $error from "../../../utils/error";
import $event from "../../event";

export default <EventStoreFactory>async function () {
    const TABLE_NAME = "mercurios_event_store";
    let mysql = await init();

    async function insert({
        topic,
        published_at,
        data,
    }: CreateParams): Promise<number> {
        let seq = await mysql(TABLE_NAME).insert({
            topic,
            published_at,
            data: $json.stringify(data),
        });

        return seq.shift() as number;
    }

    async function transaction({
        topic,
        published_at,
        data,
        expectedSeq,
    }: CreateParams): Promise<number> {
        // try {
        //     return await mysql.transaction(async (_trx) => {
        //         let seq = (
        //             await _trx(TABLE_NAME).insert({
        //                 topic,
        //                 published_at,
        //                 data: $json.stringify(data),
        //             })
        //         ).shift();

        //         $logger.debug(`got seq from mysql insert`, { seq });

        //         if (!seq) {
        //             throw $error.InternalError(
        //                 `unexpected response from store`
        //             );
        //         }

        //         if (expectedSeq !== seq) {
        //             throw $error.ExpectationFailed(
        //                 `error writing to stream - expected seq ${expectedSeq} but got ${seq}`
        //             );
        //         }

        //         return seq;
        //     });
        // } catch (err) {
        //     $logger.debug(`got error from transaction ${err.message}`);
        //     if (err.name === "ExpectationFailed") {
        //         $logger.debug(`resetting increments`);
        //         await mysql.raw(`ALTER TABLE ${TABLE_NAME} auto_increment = 1`);
        //     }
        //     throw err;
        // }

        let seq = (
            await mysql(TABLE_NAME).insert({
                topic,
                published_at,
                data: $json.stringify(data),
            })
        ).shift();

        if (!seq || seq !== expectedSeq) {
            await mysql(TABLE_NAME).where({ seq }).delete();
            await mysql.raw(`ALTER TABLE ${TABLE_NAME} AUTO_INCREMENT = 1`);

            throw $error.ExpectationFailed(
                `expected seq ${expectedSeq} but got ${seq}`
            );
        }

        return seq;
    }

    return {
        async add({ topic, published_at, data, expectedSeq }) {
            let seq = expectedSeq
                ? await transaction({ topic, published_at, data, expectedSeq })
                : await insert({ topic, published_at, data });

            return $event({ topic, published_at, data, seq });
        },

        async fetch(topic, seq) {
            let result = await mysql(TABLE_NAME)
                .where({
                    topic,
                    seq,
                })
                .first();

            if (!result) {
                throw $error.NotFound(
                    `event seq ${seq} for topic ${topic} not found`
                );
            }

            let { data, published_at } = result;

            return $event({
                topic,
                data: $json.parse(data),
                published_at,
                seq,
            });
        },

        async deleteStream(topic) {
            await mysql(TABLE_NAME).where({ topic }).delete();
            await mysql.raw(`ALTER TABLE ${TABLE_NAME} AUTO_INCREMENT = 1`);
        },
    };
};

async function init() {
    try {
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

        await driver.raw(
            `CREATE TABLE IF NOT EXISTS mercurios_event_store
            (
                topic VARCHAR(200) NOT NULL,
                seq INT UNSIGNED NOT NULL AUTO_INCREMENT,
                published_at VARCHAR(100),
                data LONGTEXT,
                PRIMARY KEY (topic,seq)
            ) ENGINE=MyISAM;`
        );

        // await driver.raw(
        //     `CREATE TABLE IF NOT EXISTS mercurios_event_store
        //     (
        //         seq INT UNSIGNED NOT NULL AUTO_INCREMENT,
        //         topic VARCHAR(200) NOT NULL,
        //         published_at VARCHAR(100),
        //         data LONGTEXT,
        //         PRIMARY KEY (seq)
        //     ) ENGINE=innoDB;`
        // );

        return driver;
    } catch (err) {
        throw err;
    }
}
