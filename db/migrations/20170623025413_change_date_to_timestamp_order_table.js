
exports.up = function(knex, Promise) {
  return knex.schema.raw('alter table orders alter column start_timestamp type timestamp')
         .raw('alter table orders alter column end_timestamp type timestamp')
         .raw('alter table orders drop column time_to_complete')
         .raw('alter table orders add column time_to_complete timestamp');
};

exports.down = function(knex, Promise) {

};
