import { expect } from "chai";
import moment from "moment";
import $error from "./error";

export type Type =
    | "number"
    | "int"
    | "float"
    | "string"
    | "any"
    | "date_string"
    | "json_string";

function testPropertyType(value: any, type: Type) {
    switch (type) {
        case "date_string":
            return dateString(value);
        case "json_string":
            return parseable(value);
        case "any":
            return Boolean(value);
        case "float":
            return expect(isNaN(parseFloat(value))).to.be.false;
        case "int":
            return expect(isNaN(parseInt(value))).to.be.false;
        default:
            return expect(value).to.be.a(type);
    }
}

function parseable(value: any) {
    try {
        JSON.parse(value);
    } catch (err) {
        throw $error.ValidationFailed(`${value} is not a valid json_string`);
    }
}

function dateString(val: any) {
    expect(val).to.be.a("string");

    expect(moment(val).isValid()).to.be.true;
}

const $assertions = {
    testObjectProperty<T = any>(object: T, key: keyof T, type: Type) {
        expect(object).to.haveOwnProperty(key.toString());

        testPropertyType(object[key], type);
    },

    testObjectSchema(object: any, schema: Record<string, Type>) {
        Object.keys(schema).forEach(key => {
            testPropertyType(object[key], schema[key]);
        });
    },

    compareOjbects(expected: any, toTest: any) {
        Object.entries(expected).forEach(([key, value]) => {
            expect(toTest[key]).to.deep.eq(value);
        });
    },

    expect,
};

export default $assertions;
