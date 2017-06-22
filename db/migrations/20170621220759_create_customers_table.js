
exports.up = function(knex, Promise) {
  return knex.schema.createTable('customers', function (table) {
    table.increments();
    table.string('phone', 20).notNullable();
    table.string('email', 100).notNullable();
    table.integer('user_id').references('id').inTable('users');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('customers');
};
