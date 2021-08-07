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
        builder.where("published_at", "<", before);
    }

    if (after) {
        builder.where("published_at", ">=", after);
    }

    return builder;
}

export function mongoEventFilters(filters: EventFilters) {
    let query: Record<string, any> = {};

    if (filters.key) {
        query.key = filters.key;
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
            $lt: filters.before,
        };
    }

    return query;
}
