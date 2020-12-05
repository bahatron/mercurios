module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: ["plugin:vue/essential", "eslint:recommended", "@vue/typescript"],
    rules: {
        "no-console": "error",
        "no-debugger": "error",
        indent: ["error", 4],
        quotes: ["off", "double"],
        "max-len": ["warn", 80],
    },
    parserOptions: {
        parser: "@typescript-eslint/parser",
    },
};
