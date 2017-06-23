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
    getOrderById: (id, cb) => {
      knex
        .select("*")
        .from("orders")
        .innerJoin('order_items', 'orders.id', 'order_items.order_id')
        .where("orders.id", id)
        .then((results) => {
          cb(null, results);
        })
        .catch((err) => {
          cb(err);
      });
    },
    insertOrder: (order, customer, orderItems, payment, cb) => {
      knex("customers")
        .returning('id') // return customer_id
        .insert(customer)
        .then((id) => {
          order.customer_id = id[0];
          return knex("orders") // insert order
                .returning('id')
                .insert(order)
        })
        .then((id) => {
          for (let idx in orderItems) {
            orderItems[idx].order_id = id[0];
          }

          return knex("order_items") // insert order_items
                .returning('order_id')
                .insert(orderItems)
        })
        .then((id) => {
          payment.order_id = id[0];
          return knex("payments") // insert payment
          .insert(payment)
        })
        .then(() => {
          cb(null);
        })
        .catch((err) => {
          cb(err);
        });
    },
    updateOrder: (id, order, cb) => {
      knex("orders")
      .where("id", id)
      .update(order)
      .then(() => {
        cb(null);
      })
      .catch((err) => {
        cb(err);
      });
    },
    getProgressData: (id, cb) => {
      knex
        .select("start_timestamp", "end_timestamp")
        .from("orders")
        .where("id", id)
        .then((result) => {
          cb(null, result);
        })
        .catch((err) => {
          cb(err);
        });
    }
  }
}
