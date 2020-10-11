import Knex from "knex";
import $config from "../../utils/config";
import $pg from "./drivers/postgres";
import { PgStream } from "./drivers/postgres/pg_stream";
import $nats from "../nats";
import { MercuriosStream } from "./interfaces";
import $error from "../../utils/error";
import $logger from "../../utils/logger";
import { MySQLStream } from "./drivers/mysql/mysql_stream";
import { $mysql } from "./drivers/mysql";
import { natsQueryToSql } from "./helpers";

export let driver: Knex;
let Stream: (topic: string) => MercuriosStream;

switch ($config.mercurios_driver) {
    case "pg":
        Stream = PgStream;
        driver = $pg;
        break;
    case "mysql":
        Stream = MySQLStream;
        driver = $mysql;
        break;
    default:
        $logger.warning("no driver found");
        break;
}

let _streams: Record<string, MercuriosStream> = {};

$nats.subscribe("mercurios_stream_deleted", (err, msg) => {
    delete _streams[msg.data];
});

$nats.subscribe("mercurios_streams_created", (err, msg) => {
    let topic = msg.data;
    if (!_streams[topic]) {
        _streams[topic] = Stream(topic);
    }
});

export const $streams = {
    async list(filter?: string): Promise<string[]> {
        let query = driver.table("mercurios_topics").select("topic");
        if (filter) {
            query.where("topic", "like", natsQueryToSql(filter));
        }

        let topics = (await query).map((record) => record.topic);

        return topics;
    },

    async createStream(topic: string): Promise<MercuriosStream> {
        try {
            await driver.table("mercurios_topics").insert({ topic, seq: 0 });

            await $nats.publish("mercurios_stream_created", topic);

            return Stream(topic);
        } catch (err) {
            if (
                (err.message as string).includes("duplicate key value") ||
                err.code.includes("ER_DUP_ENTRY")
            ) {
                return Stream(topic);
            }

            throw err;
        }
    },

    async fetchStream(topic: string): Promise<MercuriosStream | undefined> {
        if (_streams[topic]) {
            return _streams[topic];
        }

        if (await driver.table("mercurios_topics").where({ topic }).first()) {
            _streams[topic] = Stream(topic);
            return _streams[topic];
        }

        return undefined;
    },

    async deleteStream(topic: string) {
        await Promise.all([
            driver.transaction(async (trx) => {
                await trx.table("mercurios_topics").where({ topic }).delete();
                await trx.table("mercurios_events").where({ topic }).delete();
            }),

            $nats.publish("mercurios_stream_deleted", topic),
        ]);

        delete _streams[topic];
    },
};
