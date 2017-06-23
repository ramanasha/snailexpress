module.exports = (knex) => {
  return {
    getOrders: () => {
      return knex
              .select("*")
              .from("orders")
              .innerJoin('order_items', 'orders.id', 'order_items.id');
    },
    getOrderById: (id) => {
      return knex
              .select("*")
              .from("orders")
              .innerJoin('order_items', 'orders.id', 'order_items.order_id')
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
              .then((id) => {
                payment.order_id = id[0];
                return knex("payments") // insert payment
                .insert(payment)
              });
    },
    complete: (id) => {
      return knex("orders")
              .where("id", id)
              .update({end_timestamp: new Date(), status: "2"});
    },
    cancel: (id) => {
      return knex("orders")
              .where("id", id)
              .update({end_timestamp: new Date(), status: "3"});
    },
    updateTime: (id, min) => {
      return knex
              .select("time_to_complete")
              .from("orders")
              .where("id", id)
              .then((result) => {
                let timeToComplete = new Date(result[0].time_to_complete);
                timeToComplete.setMinutes(timeToComplete.getMinutes() + min);
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
              .select("start_timestamp", "time_to_complete")
              .from("orders")
              .where("id", id);
    }
  }
}
