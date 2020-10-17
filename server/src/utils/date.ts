import moment from "moment";
import $error from "./error";

export function isoString(dateString?: string) {
    if (!Boolean(dateString && moment(dateString).isValid())) {
        throw $error.ValidationFailed("not a valid date string");
    }

    return moment(dateString).toISOString();
}

export const $date = {
    isoString,
};
