
exports.up = function(knex, Promise) {
  return knex.schema.table('inventories', function (table) {
    table.string('image');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('inventories', function (table) {
    table.dropColumn('image');
  });
};
