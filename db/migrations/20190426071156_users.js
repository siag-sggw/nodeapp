exports.up = (knex, Promise) => {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('token');
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('users');
};
