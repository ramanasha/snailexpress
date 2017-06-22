module.exports = (knex) => {
  return {
    getOrders: (cb) => {
      knex
        .select("*")
        .from("orders")
        .innerJoin('order_items', 'orders.id', 'order_items.id')
        .then((results) => {
          cb(null, results);
        })
        .catch((err) => {
          cb(err);
      });
    },
    insertOrder: (order, customer, payment, cb) => {
      knex.transaction(function(trx) {
        knex("custmoers")
        .transacting(trx)
        .insert(customer)
        .then(() => {
           return  knex("orders")
                  .transacting(trx)
                  .insert(order)
                  .then(trx.commit)
                  .catch(trx.rollback);
        })
        .then(trx.commit)
        .catch(trx.rollback);
      })
      .then(function(resp) {
        console.log('Transaction complete.');
      })
      .catch(function(err) {
        console.error(err);
      });

      knex.transaction(function(trx) {

      })
      .then(function(resp) {
        console.log('Transaction complete.');
      })
      .catch(function(err) {
        console.error(err);
      });

      knex.transaction(function(trx) {
        knex("payments")
        .transacting(trx)
        .insert(payment)
        .then(trx.commit)
        .catch(trx.rollback);
      })
      .then(function(resp) {
        console.log('Transaction complete.');
      })
      .catch(function(err) {
        console.error(err);
      });
    }
  }
}
