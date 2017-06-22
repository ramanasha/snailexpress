
exports.up = function(knex, Promise) {
  return knex.schema.createTable('orders', function (table) {
    table.increments();
    table.string('status', 1).notNullable();
    table.time('time_to_complete');
    table.date('start_timestamp').notNullable();
    table.date('end_timestamp');
    table.decimal('total_price').notNullable();
    table.text('special_requests').notNullable();
    table.integer('restaurant_id').references('id').inTable('restaurants');
    table.integer('customer_id').references('id').inTable('customers');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('orders');
};
