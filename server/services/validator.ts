import { Validator, Schema } from "jsonschema";
import $error from "./error";
import $logger from "./logger";
import moment = require("moment");

const validator = new Validator();

const $validator = {
    validate(object: any, schema: Schema = {}): boolean {
        let result = validator.validate(object, schema);

        if (!result.valid) {
            $logger.debug(`validation failed `, result);
        }

        return result.valid;
    },

    string(val: any): string {
        if (!val) {
            throw $error.ValidationFailed(
                `validation failed - not valid string: ${val}`
            );
        }
        return val.toString();
    },

    nullableString(val: any): string | null {
        return val.toString() || null;
    },

    int(val: any): number {
        if (isNaN(parseInt(val))) {
            throw $error.ValidationFailed(
                `validation failed - not a number: ${val}`
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

    float(val: any): number {
        if (isNaN(parseFloat(val))) {
            throw $error.ValidationFailed(
                `validation failed - not a number: ${val}`
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

    isoDate(val: any, format?: string): string {
        if (!val || !moment(val, format).isValid()) {
            throw $error.ValidationFailed(`${val} not a valid date string`);
        }

        return moment(val).toISOString();
    },
};

export default $validator;
