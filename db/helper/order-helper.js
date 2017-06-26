module.exports = (knex) => {
  return {
    getOrders: () => {
      // Complete orders older than 30 minutes are hidden
      let timeToCompare = new Date();
      timeToCompare.setMinutes(timeToCompare.getMinutes() - 30);
      return knex
              .select("orders.id", "customer_id", "time_to_complete", "status", "start_timestamp", "end_timestamp", "total_price", "phone", "name")
              .from("orders")
              .where('start_timestamp', '>', timeToCompare)
              .orWhere("status", '<>', 'complete')
              .innerJoin('customers', 'orders.customer_id', 'customers.id')
              .orderBy('start_timestamp', 'desc');
    },
    getOrderById: (id) => {
      return knex
              .select("*")
              .from("orders")
              .innerJoin('order_items', 'orders.id', 'order_items.order_id')
              .where("orders.id", id);
    },
    getOrderItems: (id) => {
      return knex
              .select("*")
              .from("order_items")
              .innerJoin('orders', 'order_items.order_id', 'orders.id')
              .innerJoin('inventories', 'order_items.inventory_id', 'inventories.id')
              .where("orders.id", id);
    },
    insertOrder: (order, customer, orderItems, payment) => {
      return knex("customers")
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
              .then((order_id) => {
                payment.order_id = order_id[0];
                return new Promise((resolve, reject) => {
                  knex("payments") // insert payment
                    .insert(payment)
                    .then(() => resolve(order_id[0]))
                    .catch(reject);
                });
              });
    },
    setInProgress: (id, minutes) => {
      const time_to_complete = new Date();
      time_to_complete.setMinutes(time_to_complete.getMinutes() + minutes);
      return knex("orders")
              .where("id", id)
              .update({time_to_complete, status: "processing"});
    },
    complete: (id) => {
      return knex("orders")
              .where("id", id)
              .update({end_timestamp: new Date(), status: "complete"});
    },
    cancel: (id) => {
      return knex("orders")
              .where("id", id)
              .update({end_timestamp: new Date(), status: "cancelled"});
    },
    updateTime: (id, min) => {
      min = Number(min);
      return knex
              .select("time_to_complete")
              .from("orders")
              .where("id", id)
              .first()
              .then((result) => {
                let timeToComplete = new Date(result.time_to_complete);
                timeToComplete.setMinutes(timeToComplete.getMinutes() + min);
                return timeToComplete;
              })
              .then((timeToComplete) => {
                return knex("orders")
                .where("id", id)
                .update({time_to_complete: timeToComplete})
              });
    },
    updateDemoTime: (id) => {
      return knex
              .select("time_to_complete")
              .from("orders")
              .where("id", id)
              .first()
              .then((result) => {
                let timeToComplete = new Date();
                timeToComplete.setSeconds(timeToComplete.getSeconds() + 10);
                return timeToComplete;
              })
              .then((timeToComplete) => {
                return knex("orders")
                .where("id", id)
                .update({time_to_complete: timeToComplete})
              });
    },
    getProgressData: (id) => {
      return knex
              .select("start_timestamp", "time_to_complete", "status")
              .from("orders")
              .first()
              .where("id", id);
    },
    getTimeToComplete: (id) => {
      return knex
              .select("time_to_complete")
              .from("orders")
              .first()
              .where("id", id);
    }
  }
}
