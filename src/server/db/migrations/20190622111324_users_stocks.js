
exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(t) {
        t.string('love_stocks').notNull().defaultTo("");
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(t) {
        t.dropColumn('love_stocks');
    });
};
