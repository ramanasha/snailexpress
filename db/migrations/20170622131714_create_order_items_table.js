
exports.up = function(knex, Promise) {
  return knex.schema.createTable('order_items', function (table) {
    table.increments();
    table.integer('order_id').references('id').inTable('orders').notNullable();
    table.integer('inventory_id').references('id').inTable('inventories').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('order_items');
};
