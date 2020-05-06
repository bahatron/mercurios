import knex, { Config } from "knex";
import $config from "../../../utils/config";
import { EventStoreFactory, CreateParams } from "../interfaces";
import $json from "../../../utils/json";
import $error from "../../../utils/error";
import $event from "../../event";

export default <EventStoreFactory>async function () {
    const EVENT_STORE = "mercurios_event_store";
    let mysql = await init();

    async function insert({
        topic,
        published_at,
        data,
    }: CreateParams): Promise<number> {
        let seq = await mysql(EVENT_STORE).insert({
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
        throw $error.NotImplemented("functionality not implemented");
    }

    return {
        async add({ topic, published_at, data, expectedSeq }) {
            let seq = expectedSeq
                ? await transaction({ topic, published_at, data, expectedSeq })
                : await insert({ topic, published_at, data });

            return $event({ topic, published_at, data, seq });
        },

        async fetch(topic, seq) {
            let result = await mysql(EVENT_STORE)
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
            await mysql(EVENT_STORE).where({ topic }).delete();
            await mysql.raw(`ALTER TABLE ${EVENT_STORE} AUTO_INCREMENT = 1`);
        },
    };
};

async function init() {
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

    await mysql.raw(
        `CREATE TABLE IF NOT EXISTS mercurios_event_store
        (
            topic VARCHAR(200) NOT NULL,
            seq INT UNSIGNED NOT NULL AUTO_INCREMENT,
            published_at VARCHAR(100),
            data LONGTEXT,
            PRIMARY KEY (topic,seq)
        ) ENGINE=MyISAM;`
    );

    return mysql;
}
