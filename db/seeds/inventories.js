exports.seed = function(knex, Promise) {
  return knex('inventories').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('inventories').insert({image: 'acavus.png',       name: 'Acavus snails',        price: 15.00, stock: 100, weight: 1, calories: 100, description: 'This is our most popular product! 1 pound worth of Roasted Acavus Snails!'}),
        knex('inventories').insert({image: 'acavus.png',       name: 'Acavus snails',        price: 60.00, stock: 100, weight: 5, calories: 100, description: 'Get more for less! 5 pounds worth of our most popular product: Roasted Acavus Snails!'}),
        knex('inventories').insert({image: 'graceful.png',     name: 'Graceful snails',      price: 20.00, stock: 100, weight: 1, calories: 60, description: 'A light snack! 1 pound worth of live Graceful Snails!'}),
        knex('inventories').insert({image: 'corilla.png',      name: 'Corilla snails',       price: 20.00, stock: 100, weight: 1, calories: 100, description: 'Very unique flavour! 1 pound worth of marinated Corilla Snails!'}),
        knex('inventories').insert({image: 'giantafrican.png', name: 'Giant African snails', price: 100.00, stock: 100, weight: 1, calories: 300, description: 'Rich, succulent, meaty taste! 1 pound worth of rare raw Giant African snails!'})
      ])
    }).catch((err) => console.error(err));
};
