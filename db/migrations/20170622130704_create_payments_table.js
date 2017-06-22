
exports.up = function(knex, Promise) {
  return knex.schema.createTable('payments', function (table) {
    table.increments();
    table.string('type', 1).notNullable();
    table.string('card_no', 30);
    table.string('card_csc', 3);
    table.date('card_expiry');
    table.integer('order_id').references('id').inTable('orders').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('payments');
};
