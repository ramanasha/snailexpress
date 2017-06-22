
exports.up = function(knex, Promise) {
  return knex.schema.createTable('inventories', function (table) {
    table.increments();
    table.string('name', 100).notNullable();
    table.decimal('price').notNullable();
    table.integer('stock').notNullable();
    table.integer('weight');
    table.integer('calories');
    table.text('description');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('inventories');
};
