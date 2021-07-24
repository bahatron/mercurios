import { Db, MongoClient } from "mongodb";
import { $config } from "../utils/config";

export const MONGO_TOPIC_COLLECTION = "mercurios_topics";
export const MONGO_EVENT_COLLECTION = "mercurios_events";

let _client: MongoClient;

export const $mongo = {
    client(): MongoClient {
        if (_client) {
            return _client;
        }

        _client = new MongoClient($config.mongo_url, {
            replicaSet: $config.mongo_set,
        });

        _client.connect().catch((err) => {
            throw err;
        });

        return _client;
    },

    db() {
        return $mongo.client().db();
    },
};
