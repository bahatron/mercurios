import {
    $mongo,
    MONGO_TOPIC_COLLECTION,
    MONGO_EVENT_COLLECTION,
} from "../../../services/mongo";
import $error from "../../../utils/error";
import { $logger } from "../../../utils/logger";
import { MercuriosEvent } from "../../event/event";
import { StoreDriver } from "../store";

export function mongoDriver(): StoreDriver {
    return {
        async setup() {
            let mongo = await $mongo.db();

            await mongo.collection(MONGO_TOPIC_COLLECTION).createIndexes([
                {
                    key: { topic: 1 },
                },
                {
                    key: { seq: 1 },
                },
            ]);

            await mongo.collection(MONGO_EVENT_COLLECTION).createIndexes([
                {
                    key: { published_at: 1 },
                },
                {
                    key: { topic: 1 },
                },
                {
                    key: { key: 1 },
                },
                {
                    key: { seq: 1 },
                },
            ]);
        },

        async isHealthy() {
            return true;
        },

        async append(event) {
            let mongo = await $mongo.connection();
            let session = await mongo.startSession();

            try {
                let result: MercuriosEvent;

                await session.withTransaction(async () => {
                    let {
                        value: { seq: nextSeq },
                    }: any = await mongo
                        .db()
                        .collection(MONGO_TOPIC_COLLECTION)
                        .findOneAndUpdate(
                            { _id: event.topic },
                            { $inc: { seq: 1 } },
                            {
                                upsert: true,
                                returnDocument: "after",
                                session,
                            }
                        );

                    if (event.seq && event.seq !== nextSeq) {
                        $logger.info(
                            { nextSeq, expectedSeq: event.seq },
                            "conflict, reverting..."
                        );

                        throw $error.ExpectationFailed(
                            "Conflict with expected sequence",
                            {
                                code: "ERR_CONFLICT",
                                expectedSeq: event.seq,
                                nextSeq,
                            }
                        );
                    }

                    result = {
                        ...event,
                        seq: event.seq || nextSeq,
                    };

                    await mongo
                        .db()
                        .collection(MONGO_EVENT_COLLECTION)
                        .insertOne({ ...result }, { session });
                });

                return result!;
            } catch (err) {
                throw err;
            } finally {
                $logger.info(`ending session...`);
                await session.endSession();
            }
        },

        async read(topic, seq) {
            let mongo = await $mongo.db();

            let event: any = await mongo
                .collection(MONGO_EVENT_COLLECTION)
                .findOne({ topic, seq });

            return event;
        },

        async filter() {
            return [];
        },

        async latest() {
            return <any>{};
        },
        async createStream(topic) {},

        async deleteStream(topic) {
            let mongo = await $mongo.connection();

            await mongo
                .db()
                .collection(MONGO_EVENT_COLLECTION)
                .deleteOne({ topic });

            await mongo
                .db()
                .collection(MONGO_EVENT_COLLECTION)
                .deleteMany({ topic });
        },

        async streamExists() {
            return true;
        },

        async topics() {
            return [];
        },
    };
}
