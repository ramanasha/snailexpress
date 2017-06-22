
exports.up = function(knex, Promise) {
  return knex.schema.createTable('restaurants', function (table) {
    table.increments();
    table.string('name', 100).notNullable();
    table.string('phone', 20).notNullable();
    table.integer('location_id').references('id').inTable('location').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('restaurants');
};
