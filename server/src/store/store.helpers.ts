import Knex from "knex";
import { $logger } from "../utils/logger";
import { $validator } from "../utils/validator";

export const COLLECTION = {
    EVENTS: `mercurios_events`,
    TOPICS: `mercurios_topics`,
};

export interface EventFilters {
    from?: number;
    to?: number;
    key?: string;
    before?: string;
    after?: string;
}

export function natsQueryToSql(filter: string): string {
    let split = filter.split(".");
    let index = split.indexOf(">");

    if (index >= 0) {
        split.splice(index, split.length, "%");
    }

    return split
        .map((item) => (item === "*" ? "%" : item))
        .reduceRight((carry, value, index, arr) => {
            if (value === "%" && arr[index - 1] === "%") {
                return carry;
            }
            carry.push(value);
            return carry;
        }, [] as string[])
        .reverse()
        .join(".");
}

export function knexEventFilter(
    builder: Knex.QueryBuilder,
    filters: EventFilters
): Knex.QueryBuilder {
    let { from, to, key, before, after } = filters;

    $logger.debug(filters, "filters");

    if (from) {
        builder.where("seq", ">=", from);
    }

    if (to) {
        builder.where("seq", "<=", to);
    }

    if (key) {
        builder.where({ key });
    }

    if (before) {
        builder.where("published_at", "<=", before);
    }

    if (after) {
        builder.where("published_at", ">=", after);
    }

    return builder;
}
