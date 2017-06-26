
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('restaurants').del()
    .then(knex('locations').del())
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('location').insert({id: 1, street: '123 ABC Street', latitude: '32"', longitude: '12"'})
      ]);
    })
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('restaurants').insert({id: 1, name: 'Original Restaurant', phone: '3217236713', location_id: 1})
      ]);
    });
};
