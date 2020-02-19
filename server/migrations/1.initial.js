exports.up = async function up(knex) {
    if (!(await knex.schema.hasTable("mercurios_streams"))) {
        return knex.schema.createTable("mercurios_streams", table => {
            table.string("topic").unique();
            table.string("table_name").unique();
            table.text("schema", "longtext");
        });
    }
};

exports.down = async function down(knex) {
    return knex.schema.dropTableIfExists("mercurios_streams");
};
