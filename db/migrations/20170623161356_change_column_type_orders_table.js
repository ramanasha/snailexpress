
exports.up = function(knex, Promise) {
  return knex.schema.raw('alter table orders alter column status type varchar(10)');
};

exports.down = function(knex, Promise) {

};
