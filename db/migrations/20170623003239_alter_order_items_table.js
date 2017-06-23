
exports.up = function(knex, Promise) {
  return knex.schema.table('order_items', function (table) {
    table.integer('qty');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('order_items', function (table) {
    table.dropColumn('qty');
  });
};
