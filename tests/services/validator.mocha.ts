import $validator from "../../src/services/validator";
import $mocha from "../settings.mocha";

describe("Validator services", () => {
    it("returns true on empty object schema", () => {
        $mocha.expect($validator.validate({ foo: "bar" }, {})).to.be.true;
    });

    it("returns true if no schema is passed", () => {
        $mocha.expect($validator.validate({ foo: "bar" })).to.be.true;
    });

    it("returns true with invalid schema", () => {
        $validator.validate(
            { foo: "bar", rick: "wat" },
            { rick: "sanchez", type: "antrosfs" }
        );
    });
});
