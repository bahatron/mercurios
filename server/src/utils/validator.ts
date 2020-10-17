import moment = require("moment");
import $error from "./error";
import $jsonschema, { Schema } from "jsonschema";

const _validator = new $jsonschema.Validator();

export const $validator = {
    jsonSchema(val: any, schema: Schema) {
        let { errors } = _validator.validate(val, schema);

        return errors;
    },

    string(val: any, message?: string): string {
        if (typeof val !== "string") {
            throw $error.ValidationFailed(
                message || `validation failed - not valid string: ${val}`
            );
        }
        return val;
    },

    optionalString(val: any): string | null {
        return typeof val === "string" ? val : null;
    },

    int(val: any, message?: string): number {
        if (isNaN(parseInt(val))) {
            throw $error.ValidationFailed(
                message || `validation failed - not a number: ${val}`
            );
        }

        return parseInt(val);
    },

    optionalInt(val: any): number | null {
        if (isNaN(parseInt(val))) {
            return null;
        }

        return parseInt(val);
    },

    float(val: any, message?: string): number {
        if (isNaN(parseFloat(val))) {
            throw $error.ValidationFailed(
                message || `validation failed - not a number: ${val}`
            );
        }

        return parseFloat(val);
    },

    optionalFloat(val: any): number | null {
        if (isNaN(parseFloat(val))) {
            return null;
        }

        return parseFloat(val);
    },

    isoDate(val: any, message?: string): string {
        if (val && moment(val).isValid()) {
            return moment(val).toISOString();
        }

        throw $error.ValidationFailed(
            message || `${val} not a valid date string`
        );
    },

    isIsoDate(val: any): boolean {
        return Boolean(val && moment(val).isValid());
    },
};

export default $validator;
