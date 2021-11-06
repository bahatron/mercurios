import { Knex } from "knex";
import { EventFilters } from "../client/interfaces";

export function knexEventFilter(
    builder: Knex.QueryBuilder,
    filters: EventFilters
): Knex.QueryBuilder {
    let { from, to, key, before, after } = filters;

    if (from) {
        builder.where("seq", ">=", from);
    }

    if (to) {
        builder.where("seq", "<", to);
    }

    if (key) {
        builder.where({ key });
    }

    if (before) {
        builder.where("timestamp", "<", before);
    }

    if (after) {
        builder.where("timestamp", ">=", after);
    }

    return builder;
}
