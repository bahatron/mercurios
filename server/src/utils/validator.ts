import $error from "./error";
import moment = require("moment");

const $validator = {
    string(val: any, message?: string): string {
        if (typeof val !== "string") {
            throw new Error(
                message || `validation failed - not valid string: ${val}`
            );
        }
        return val;
    },

    nullableString(val: any): string | null {
        return typeof val === "string" ? val : null;
    },

    int(val: any, message?: string): number {
        if (isNaN(parseInt(val))) {
            throw new Error(
                message || `validation failed - not a number: ${val}`
            );
        }

        return parseInt(val);
    },

    nullableInt(val: any): number | null {
        if (isNaN(parseInt(val))) {
            return null;
        }

        return parseInt(val);
    },

    float(val: any, message?: string): number {
        if (isNaN(parseFloat(val))) {
            throw new Error(
                message || `validation failed - not a number: ${val}`
            );
        }

        return parseFloat(val);
    },

    nullableFloat(val: any): number | null {
        if (isNaN(parseFloat(val))) {
            return null;
        }

        return parseFloat(val);
    },

    isoDate(val: any, message?: string): string {
        if (!val || !moment(val).isValid()) {
            throw new Error(message || `${val} not a valid date string`);
        }

        return moment(val).toISOString();
    },
};

export default $validator;
