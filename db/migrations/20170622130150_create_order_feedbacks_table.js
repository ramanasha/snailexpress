
exports.up = function(knex, Promise) {
  return knex.schema.createTable('order_feedbacks', function (table) {
    table.increments();
    table.text('text').notNullable();
    table.integer('order_id').references('id').inTable('orders').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('order_feedbacks');
};
