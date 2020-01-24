import { Validator, Schema } from "jsonschema";
import $error from "./error";

const validator = new Validator();

const $validator = {
    validate(object: any, schema: Schema = {}): boolean {
        let result = validator.validate(object, schema);

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
};

export default $validator;
