import moment = require("moment");
import $error from "./error";

const $date = {
    isValid(str: string): boolean {
        return moment(str).isValid();
    },

    create(): string {
        return moment().format();
    },

    dateString(_str: any): string {
        if (!$date.isValid(_str)) {
            throw $error.ValidationFailed(`${_str} is not a valid date string`);
        }

        return _str;
    },
};

export default $date;
