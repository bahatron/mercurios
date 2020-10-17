import moment from "moment";

export function isoString() {
    return moment().toISOString();
}

export const $date = {
    isoString,
};
