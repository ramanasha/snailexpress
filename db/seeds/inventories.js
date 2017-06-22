exports.seed = function(knex, Promise) {
  return knex('inventories').del()
    .then(function () {
      return Promise.all([
                // Inserts seed entries
        knex('inventories').insert({image: '../../public/images/products/avacus.png',       name: 'Acavus snails',        price: 15.00, stock: 100, weight: 1, calories: 100, description: '1 pound worth of our most popular product: roasted acavus snails!'}),
        knex('inventories').insert({image: '../../public/images/products/avacus.png',       name: 'Acavus snails',        price: 50.00, stock: 100, weight: 5, calories: 500, description: '5 pounds worth of our most popular product: roasted acavus snails!'}),
        knex('inventories').insert({image: '../../public/images/products/graceful.png',     name: 'Graceful snails',      price: 20.00, stock: 100, weight: 1, calories: 100, description: '1 pound worth of marinated graceful snails!'}),
        knex('inventories').insert({image: '../../public/images/products/corilla.png',      name: 'Corilla snails',       price: 20.00, stock: 100, weight: 5, calories: 500, description: '1 pound worth of alive corilla snails!'}),
        knex('inventories').insert({image: '../../public/images/products/giantafrican.png', name: 'Giant African snails', price: 10.00, stock: 100, weight: 1, calories: 150, description: '1 pound worth of raw Giant African snails!'})
      ])
    }).catch((err) => console.error(err));
};
