
exports.up = function(knex, Promise) {
  return knex.schema.createTable('inventory_ratings', function (table) {
    table.increments();
    table.integer('rating');
    table.integer('customer_id').references('id').inTable('customers').notNullable();
    table.integer('inventory_id').references('id').inTable('inventories').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('inventory_ratings');
};
