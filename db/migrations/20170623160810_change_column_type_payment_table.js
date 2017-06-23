
exports.up = function(knex, Promise) {
  return knex.schema.raw('alter table payments alter column type type varchar(10)');
};

exports.down = function(knex, Promise) {

};
