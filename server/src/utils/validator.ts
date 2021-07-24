import moment = require("moment");
import $error from "./error";
import jsonschema, { Schema } from "jsonschema";

const _validator = new jsonschema.Validator();

export const $validator = {
    /**
     * @description
     *
     * Validates using json schema, throws validation error on failure
     */
    schema(val: any, schema: Schema) {
        let { errors } = _validator.validate(val, schema);

        if (errors.length) {
            throw $error.ValidationFailed(`json schema validation failed`, {
                errors,
            });
        }
    },

    string(val: any, message?: string): string {
        if (typeof val !== "string") {
            throw $error.ValidationFailed(
                message || `validation failed - not valid string: ${val}`
            );
        }
        return val;
    },

    optionalString(val: any): string | undefined {
        return typeof val === "string" ? val : undefined;
    },

    int(val: any, message?: string): number {
        if (isNaN(parseInt(val))) {
            throw $error.ValidationFailed(
                message || `validation failed - not a number: ${val}`
            );
        }

        return parseInt(val);
    },

    optionalInt(val: any): number | undefined {
        if (isNaN(parseInt(val))) {
            return undefined;
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

    optionalFloat(val: any): number | undefined {
        if (isNaN(parseFloat(val))) {
            return undefined;
        }

        return parseFloat(val);
    },
};
