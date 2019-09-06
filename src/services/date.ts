import moment = require("moment");
import $error from "@bahatron/error";

const $date = {
    isValid(str: string): boolean {
        return moment(str).isValid();
    },

    /** @todo: allow invoking this function as $date() */
    create(): string {
        return moment().format();
    },

    dateString(_str: any): string {
        if (!$date.isValid(_str)) {
            throw $error.ValidationError(`${_str} is not a valid date string`);
        }

        return _str;
    }
};

export default $date;
