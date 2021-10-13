export const $config = {
    test_url:
        process.env.MERCURIOS_TEST_URL ||
        "postgres://admin:secret@localhost:5432/postgres",
};
