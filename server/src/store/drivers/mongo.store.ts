import {
    $mongo,
    MONGO_TOPIC_COLLECTION,
    MONGO_EVENT_COLLECTION,
} from "../../services/mongo";
import $error from "../../utils/error";
import { $logger } from "../../utils/logger";
import { MercuriosEvent } from "../../models/event";
import { StoreDriver } from "../store";
import { COLLECTION } from "../store.helpers";

export function mongoDriver(): StoreDriver {
    return {
        async setup() {
            let mongo = await $mongo.db;

            await mongo.collection(MONGO_EVENT_COLLECTION).createIndexes([
                {
                    key: { published_at: 1 },
                },
                {
                    key: { key: 1 },
                },
            ]);

            await mongo.collection(MONGO_EVENT_COLLECTION).createIndex(
                {
                    topic: 1,
                    seq: 1,
                },
                { unique: true }
            );
        },

        async isHealthy() {
            return await $mongo.db.slaveOk;
        },

        async append(event) {
            let session = await $mongo.client().startSession();

            try {
                let result: MercuriosEvent;

                await session.withTransaction(async () => {
                    let {
                        value: { seq: nextSeq },
                    }: any = await $mongo.db
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
                        throw $error.ExpectationFailed(
                            "Conflict with expected sequence",
                            {
                                code: "ERR_CONFLICT",
                                expectedSeq: event.seq,
                                nextSeq,
                            }
                        );
                    }

                    result = MercuriosEvent({
                        ...event,
                        seq: event.seq || nextSeq,
                    });

                    await $mongo.db
                        .collection(COLLECTION.EVENTS)
                        .insertOne({ ...result }, { session });
                });

                return result!;
            } catch (err) {
                throw err;
            } finally {
                await session.endSession();
            }
        },

        async read(topic, seq) {
            let mongo = await $mongo.client().db();

            let event: any = await mongo
                .collection(COLLECTION.EVENTS)
                .findOne({ topic, seq: Number(seq) });

            console.log(event);
            
            if (!event) {
                return undefined;
            }

            return MercuriosEvent(event);
        },

        async filter(topic, filters) {
            let query: Record<string, any> = {
                topic,
            };

            if (filters.key) {
                query.key = RegExp(filters.key);
            }

            if (filters.from) {
                query.seq = {
                    ...(query.seq ?? {}),
                    $gte: Number(filters.from),
                };
            }

            if (filters.to) {
                query.seq = {
                    ...(query.seq ?? {}),
                    $lte: Number(filters.to),
                };
            }

            if (filters.after) {
                query.published_at = {
                    ...(query.published_at ?? {}),
                    $gte: filters.after,
                };
            }

            if (filters.before) {
                query.published_at = {
                    ...(query.published_at ?? {}),
                    $lte: filters.before,
                };
            }

            $logger.debug(query, "filter query");
            console.log(query);

            return (
                await $mongo.db
                    .collection(COLLECTION.EVENTS)
                    .find(query)
                    .toArray()
            ).map(MercuriosEvent);
        },

        async latest(topic) {
            let topicIndex = await $mongo.db
                .collection(COLLECTION.TOPICS)
                .findOne({ _id: topic });

            if (!topicIndex) {
                return undefined;
            }

            return topicIndex?.seq;
        },

        async deleteStream(topic) {
            let mongo = await $mongo.client();

            await mongo
                .db()
                .collection(COLLECTION.EVENTS)
                .deleteMany({ topic });

            await mongo
                .db()
                .collection(COLLECTION.TOPICS)
                .deleteOne({ _id: topic });

            $logger.info(`stream deleted for topic: ${topic}`);
        },

        async streamExists(topic) {
            let result = await $mongo.db
                .collection(COLLECTION.TOPICS)
                .findOne({ _id: topic });

            return Boolean(result);
        },

        async topics({ like = "", withEvents }) {
            let parsedLike = like.includes(`.>`)
                ? `${like.slice(0, like.indexOf(".>") ?? undefined)}\\.`
                : like;

            $logger.debug({ like, parsedLike }, "nats to mongo translation");

            return (
                await $mongo.db
                    .collection(COLLECTION.TOPICS)
                    .find({ _id: new RegExp(parsedLike) })
                    .toArray()
            ).map((record) => record._id);
        },
    };
}
