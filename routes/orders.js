"use strict";

const express = require('express');
const router  = express.Router();

// Status => 1. in progress 2: complete 3: cancel
module.exports = (OrderHelper, InventoryHelper) => {

  router.get("/", (req, res) => {
    OrderHelper.getOrders((err, orders) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(orders);
      }
    });
  });

  router.get("/:id", (req, res) => {
    let id = req.params.id;

    OrderHelper.getOrderById(id, (err, orders) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(orders);
      }
    });
  });

  router.get("/progress/:id", (req, res) => {
    let id = req.params.id;

    OrderHelper.getProgressData(id, (err, orders) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(orders);
      }
    });
  });

  router.put("/", (req, res) => {
    let id = req.params.id;

    OrderHelper.getProgressData(id, (err, orders) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(orders);
      }
    });
  });

  /* Format
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

    if (paymentType === '1') { // card
      name = payment.credit.name;
      phone = payment.credit.phone;
      cardNo = payment.credit.card_no;
      cardCsc = payment.credit.card_csc;
      cardExpiry = payment.credit.card_expiry;
    } else if (paymentType === '2') {
      name = payment.debit.name;
      phone = payment.debit.phone;
    } else if (paymentType === '3') {
      name = payment.store.name;
      phone = payment.store.phone;
    }

    // extract all item ids
    for (let idx in items) {
      itemsIds.push(items[idx].id);
    }

    new Promise((resolve, reject) => {
      // get price infomation
      InventoryHelper.getPriceByIds(itemsIds, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    }).then((result) => {
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

      let order = {
        status: 1,
        start_timestamp: new Date(),
        total_price: totalPrice,
        special_requests: specialRequests,
        restaurant_id: restaurantId
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

      for (let idx in itemsIds) {
        let data = {
          inventory_id: itemsIds[idx]
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
