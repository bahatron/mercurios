import { Validator, Schema } from "jsonschema";

const validator = new Validator();

const $validator = {
    validate(object: any, schema: any = {}): boolean {
        let result = validator.validate(object, schema);

        return result.valid;
    }
};

export default $validator;
