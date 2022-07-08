let { MERCURIOS_TEST_URL } = process.env;

export const $config = {
    TEST_URL:
        MERCURIOS_TEST_URL || "postgres://admin:secret@localhost:5432/postgres",
};
