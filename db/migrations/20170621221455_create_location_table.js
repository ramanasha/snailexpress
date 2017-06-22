
exports.up = function(knex, Promise) {
  return knex.schema.createTable('location', function (table) {
    table.increments();
    table.string('street', 150).notNullable();
    table.string('longitude', 40).notNullable();
    table.string('latitude', 40).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('location');
};
