import { MercuriosStream } from "../../interfaces";
import $event, { MercuriosEvent } from "../../../../models/event/event";
import $json from "../../../../utils/json";
import $nats from "../../../nats";
import $error, { ERROR_CODES } from "../../../../utils/error";
import $pg from ".";
import { $validator } from "../../../../utils/validator";
import { sqlEventFilters } from "../../helpers";

const EVENT_TABLE = "mercurios_events";
const TOPIC_TABLE = "mercurios_topics";
const PROCEDURE = "store_event";

export function PgStream(_topic: string): MercuriosStream {
    return {
        async append({ published_at, data, seq: expected_seq, key }) {
            try {
                let parsedData = $json.stringify(data);

                let result = await $pg.raw(`call ${PROCEDURE}(?, ?, ?, ?, ?)`, [
                    _topic,
                    (expected_seq || null) as any,
                    published_at,
                    key || null,
                    parsedData || null,
                ]);

                let resultData = result.rows.shift();

                // return $event(await testTransaction(params));
                return $event({
                    topic: resultData.v_topic,
                    key: resultData.v_key,
                    seq: resultData.v_seq,
                    published_at: resultData.v_published_at,
                    data: resultData.v_data,
                });
            } catch (err) {
                if ((err.message as string).includes("ERR_CONFLICT")) {
                    throw $error.ExpectationFailed(
                        "Conflict with expected sequence",
                        {
                            code: "ERR_CONFLICT",
                            expected_seq,
                        }
                    );
                }
                await $nats.publish("mercurios_stream_deleted", _topic);

                if ((err.message as string).includes("ERR_NO_STREAM")) {
                    throw $error.NotFound(`Stream for ${_topic} not found`);
                }

                throw err;
            }
        },

        async read(seq) {
            let result = await $pg
                .table(EVENT_TABLE)
                .where({ topic: _topic, seq })
                .first();

            if (!result) {
                return undefined;
            }

            return $event(result);
        },

        async filter(filters) {
            let query = $pg
                .table(EVENT_TABLE)
                .select("*")
                .where({ topic: _topic });

            let result = await sqlEventFilters(query, filters);

            return result.map($event);
        },
    };
}
