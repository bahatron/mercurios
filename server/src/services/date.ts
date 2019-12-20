import moment from "moment";
import $error from "./error";

const $date = {
    isValid(str: string): boolean {
        if (!str) {
            return false;
        }

        return moment(str).isValid();
    },

    dateString(date?: string): string {
        return moment(date).format();
    },
};

export default $date;
