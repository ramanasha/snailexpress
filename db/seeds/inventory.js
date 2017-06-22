exports.seed = function(knex, Promise) {
  return knex('inventory').del()
    .then(function () {
      return Promise.all([
                // Inserts seed entries
        knex('inventory').insert({name: 'red snails', price: 1.00, stock: 100 weight: 1 calories: 5, description: '1 red snail, our most popular order!'}),
        knex('inventory').insert({name: 'red snails', price: 50.00, stock: 100 weight: 5 calories: 500, description: '5 pounds worth of our most popular red snails!'}),
        knex('inventory').insert({name: 'yellow snails', price: 20.00, stock: 100 weight: 1 calories: 100, description: '1 pound worth of yellow snails!'}),
        knex('inventory').insert({name: 'green snails', price: 20.00, stock: 100 weight: 5 calories: 500, description: '1 pound worth of green snails!'}),
      ])
    }).catch((err) => console.error(err));
};
