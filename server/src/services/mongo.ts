import { MongoClient, Db } from "mongodb";
import { $config } from "../utils/config";

export const MONGO_TOPIC_COLLECTION = "mercurios_topics";
export const MONGO_EVENT_COLLECTION = "mercurios_events";

let connection: MongoClient;
export const $mongo = {
    async db(): Promise<Db> {
        return (await $mongo.connection()).db();
    },

    async connection(): Promise<MongoClient> {
        if (connection) {
            return connection;
        }

        let client = new MongoClient($config.mongo_url);

        connection = await new Promise<MongoClient>((resolve, reject) => {
            client
                .connect()
                .then((conn) => {
                    resolve(conn);
                })
                .catch(reject);
        }).catch((err) => {
            throw err;
        });

        return connection;
    },
};
