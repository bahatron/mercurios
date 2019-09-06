import $assertions from "../src/services/assertions";
import { expect } from "chai";

after(() => setTimeout(process.exit, 100));

const $mocha = {
    ...$assertions,
    expect
};

export default $mocha;
