"use strict";

const sms = require('../lib/sms-helper');
const express = require('express');
const router  = express.Router();

// Status => 1. in progress 2: complete 3: cancel
module.exports = (OrderHelper, InventoryHelper) => {

  // [api/orders/] : return all order list
  router.get("/", (req, res) => {
    OrderHelper.getOrders((err, orders) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(orders);
      }
    });
  });

  // incoming sms example code
  // todo : implement incoming sms
  router.post('/sms', function(req, res) {
    let twilio = require('twilio');
    let twiml = new twilio.TwimlResponse();
    twiml.message('The Robots are coming! Head for the hills!');
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  });

  // [api/orders/:id] : return an order by order id
  router.get("/:id", (req, res) => {
    let id = req.params.id;

    OrderHelper.getOrderById(id)
      .then((orders) => {
        res.json(orders);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // [api/orders/:id/progress] : returun start_timestamp and time_to_complete by order id
  router.get("/:id/progress", (req, res) => {
    let id = req.params.id;

    OrderHelper.getProgressData(id)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // [api/orders/:id/complete] : update current status to complete
  router.put("/:id/complete", (req, res) => {
    let id = req.params.id;

    OrderHelper.complete(id)
      .then(() => {
        return sms.sendSMS("437-345-2360", "Ready to pick up!");
      })
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // [api/orders/:id/cancel] : update current status to cancel
  router.put("/:id/cancel", (req, res) => {
    let id = req.params.id;

    OrderHelper.cancel(id)
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  /* format
    {
      min: 50
    }
  */
  //[api/orders/:id/update_time] : update time_to_complete (unit: minute)
  router.put("/:id/update_time", (req, res) => {
    if (!req.body) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }

    let id = req.params.id;
    let min = req.body.min;

    OrderHelper.updateTime(id, min)
      .then(() => {
        res.json(orders);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  /* json fomat example
  {
    "payment": {
        "type": "1", // 1: credit, 2: debit, 3: pay store
        "credit": {
          "name": "kim",
          "phone": "222-222-2222",
          "card_no": "2222-2222-2222-2222",
          "card_cvc": "222",
          "card_expiry": "2022-11-11"
        }
    },
    "order": {
      "special_requests": "bla~bla~bla~",
      "restaurant_id": 1,
      "min" : 30,
      "items":[
          {
              "id": 1,
              "qty": 2
          },
          {
              "id": 2,
              "qty": 4
          }
      ]
    }
  }
  */
  // [api/orders] : create new order
  router.post("/", (req, res) => {
    if (!req.body) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }

    let items = req.body.order.items;
    let specialRequests = req.body.order.special_requests;
    let restaurantId = req.body.order.restaurant_id;
    let itemsIds = [];
    let payment = req.body.payment;
    let paymentType = req.body.payment.type;
    let name = null;
    let phone = null;
    let cardNo = null;
    let cardCsc = null;
    let cardExpiry = null;
    let email = "";
    let min = req.body.order.min;

    if (paymentType === 'credit_card') { // card
      name = payment.credit.name;
      phone = payment.credit.phone;
      cardNo = payment.credit.card_no;
      cardCsc = payment.credit.card_csc;
      cardExpiry = payment.credit.card_expiry;
    } else if (paymentType === 'debit_card') {
      name = payment.debit.name;
      phone = payment.debit.phone;
    } else if (paymentType === 'pay_in_store') {
      name = payment.store.name;
      phone = payment.store.phone;
    }

    // extract all item ids
    for (let idx in items) {
      itemsIds.push(items[idx].id);
    }

    // get price infomation
    InventoryHelper.getPriceByIds(itemsIds)
    .then((result) => {
      // add price to item object
      for (let idx in items) {
        for (let dbIdx in result) {
          if (items[idx].id === result[dbIdx].id) {
            items[idx].price = result[dbIdx].price;
            break;
          }
        }
      }

      return items;
    }).then((items) => {
      // caculate total price
      let totalPrice = items.reduce((total, current) => {
        return Number(total.price * total.qty) + Number(current.price * current.qty);
      });

      let timeToComplete = new Date();
      timeToComplete.setMinutes(timeToComplete.getMinutes() + min);

      let order = {
        status: 'incomplete',
        start_timestamp: new Date(),
        total_price: totalPrice,
        special_requests: specialRequests,
        restaurant_id: restaurantId,
        time_to_complete: timeToComplete
      };

      let payment = {
        type: paymentType,
        card_no: cardNo,
        card_csc: cardCsc,
        card_expiry: cardExpiry
      }

      let customer = {
        phone: phone,
        email: email
      }

      let orderItems = [];

      for (let idx in items) {
        let data = {
          inventory_id: items[idx].id,
          qty: items[idx].qty
        }
        orderItems.push(data);
      }

      // insert order to table
      OrderHelper.insertOrder(order, customer, orderItems, payment, (err) => {
        if (err) {
          throw new Error(err);
        } else {
          res.status(201).send();
        }
      });
    }).catch((err) => {
      res.status(500).json({ error: err.message });
    });
  });

  return router;
}
