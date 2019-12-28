exports.up = async function up(knex) {
    if (!(await knex.schema.hasTable("stream_definitions"))) {
        return knex.schema.createTable("stream_definitions", table => {
            table.string("topic").unique();
            table.text("schema", "longtext");
        });
    }
};

exports.down = async function down(knex) {
    return knex.schema.dropTableIfExists("stream_definitions");
};
