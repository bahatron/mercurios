import { MongoClient } from "mongodb";
import { $config } from "../utils/config";

let _client: MongoClient;

export const $mongo = {
    client(): MongoClient {
        if (_client) {
            return _client;
        }

        _client = new MongoClient($config.mongo_url);

        _client.connect().catch((err) => {
            throw err;
        });

        return _client;
    },

    get db() {
        return $mongo.client().db();
    },
};
