
exports.up = function(knex, Promise) {
  return knex.schema.table('customers', function (table) {
    table.string('name', 100);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('customers', function (table) {
    table.dropColumn('name');
  });
};
