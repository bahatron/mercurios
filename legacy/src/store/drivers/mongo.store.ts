import { $mongo } from "../../services/mongo";
import $error from "../../utils/error";
import { $logger } from "../../utils/logger";
import { MercuriosEvent } from "../../models/event";
import { StoreDriver } from "../store";
import { COLLECTION, mongoEventFilters } from "../store.helpers";

export function mongoDriver(): StoreDriver {
    return {
        async setup() {
            let mongo = await $mongo.db;

            await mongo.collection(COLLECTION.EVENTS).createIndexes([
                {
                    key: { published_at: 1 },
                },
                {
                    key: { key: 1 },
                },
            ]);

            await mongo.collection(COLLECTION.EVENTS).createIndex(
                {
                    topic: 1,
                    seq: 1,
                },
                { unique: true }
            );
        },

        async isHealthy() {
            return Boolean(await $mongo.db.listCollections());
        },

        async append(event) {
            let session = await $mongo.client().startSession();

            try {
                let result: MercuriosEvent;

                await session.withTransaction(async () => {
                    let {
                        value: { seq: nextSeq },
                    }: any = await $mongo.db
                        .collection(COLLECTION.TOPICS)
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

            if (!event) {
                return undefined;
            }

            return MercuriosEvent(event);
        },

        async filter(topic, filters) {
            return (
                await $mongo.db
                    .collection(COLLECTION.EVENTS)
                    .find({
                        topic,
                        ...mongoEventFilters(filters),
                    })
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

            return this.read(topic, topicIndex?.seq);
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

        async topics({ like = "", withEvents, limit, offset }) {
            let parsedLike = like.includes(`.>`)
                ? `${like.slice(0, like.indexOf(".>") ?? undefined)}\\.`
                : like;

            if (withEvents) {
                let result = await $mongo.db
                    .collection(COLLECTION.EVENTS)
                    .find(
                        {
                            topic: new RegExp(parsedLike),
                            ...mongoEventFilters(withEvents),
                        },
                        {
                            sort: { topic: 1 },
                            skip: offset,
                            limit: limit,
                            projection: {
                                topic: 1,
                            },
                        }
                    )
                    .toArray();

                return Array.from(
                    new Set(result.map((record) => record.topic))
                );
            }

            return (
                await $mongo.db
                    .collection(COLLECTION.TOPICS)
                    .find(
                        { _id: new RegExp(parsedLike) },
                        {
                            projection: { _id: 1 },
                            sort: { _id: 1 },
                            skip: offset,
                            limit: limit,
                        }
                    )
                    .toArray()
            ).map((record) => record._id);
        },
    };
}
