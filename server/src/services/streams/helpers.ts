import Knex from "knex";
import { $validator } from "../../utils/validator";
import { EventFilters } from "./interfaces";

export function natsQueryToSql(filter: string): string {
    let splitted = filter.split(".");
    let index = splitted.indexOf(">");

    if (index >= 0) {
        splitted.splice(index, splitted.length, "%");
    }

    return splitted
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

export function sqlEventFilters(
    builder: Knex.QueryBuilder,
    filters: EventFilters
) {
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
        builder.where(
            "published_at",
            "<",
            $validator.isoDate(before, `Invalid date format: ${before}`)
        );
    }

    if (after) {
        builder.where(
            "published_at",
            ">",
            $validator.isoDate(after, `Invalid date format: ${after}`)
        );
    }

    return builder;
}
