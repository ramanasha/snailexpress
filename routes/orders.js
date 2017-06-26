"use strict";

const sms = require('../lib/sms-helper');
const express = require('express');
const moment = require('moment');
const router  = express.Router();
const validate = require('validate.js');

// Status => 1. in progress 2: complete 3: cancel
module.exports = (OrderHelper, InventoryHelper) => {

  // [api/orders/] : return all order list
  router.get("/", (req, res) => {
    OrderHelper.getOrders()
      .then((orders) => {
        console.log(orders);
        res.json(orders);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
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

  // [api/orders/:id/order_items] : return order items by order id
  router.get("/:id/order_items", (req, res) => {
    let id = req.params.id;

    OrderHelper.getOrderItems(id)
      .then((items) => {
        res.json(items);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // [api/orders/:id/progress] : return start_timestamp and time_to_complete by order id
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

  // [api/orders/:id/due] : returun due in time
  router.get("/:id/due", (req, res) => {
    let id = req.params.id;

    OrderHelper.getTimeToComplete(id)
      .then((result) => {
        let currentTime = moment(new Date());
        let timeToComplete = moment(result.time_to_complete);
        let due = timeToComplete.diff(currentTime, 'minute');
        if (due < 0) {
          due = 0;
        }
        res.json(due);
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
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  /* json format example
  {
    contact: {
      name: "kim",
      phone: "222-222-2222",
    }
    "payment": {
        "type": "1", // 1: credit, 2: debit, 3: pay store
        "credit": {
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
  
  
  var newOrderConstraints = {
    "order.items": {
      presence: true
    },
    "order.special_requests": {
      presence: { allowEmpty: true }
    },
    "contact.name": {
      presence: true
    },
    "contact.phone": {
      presence: true
    },
    "order.restaurant_id": {
      presence: true
    },
    "payment": {
      presence: true
    },
    "payment.type": {
      presence: true
    }
  };
  
  var orderItemConstraints = {
    "id": {
      presence: true,
    },
    "qty": {
      presence: true,
    }
  };
  
  var creditCardPaymentConstraints = {
    "payment.credit.card_no": {
      presence: true,
      format: {
        pattern: /^(\d{4}-){3}\d{4}$/,
        message: "must be in the form 1234-1234-1234-1234."
      }
    },
    "payment.credit.card_cvc": {
      presence: true,
      length: {
        is: 3,
        wrongLength: "must be three numbers long"
      },
      numericality: true
    },
    "payment.credit.card_expiry_month": {
      presence: true,
      numericality: {
        greaterThanOrEqualTo: 1,
        lessThanOrEqualTo: 12,
        onlyInteger: true,
        strict: true
      }
    },
    "payment.credit.card_expiry_year": {
      presence: true,
      length: {
        mininum: 4
      },
      numericality: {
        onlyInteger: true,
        strict: true
      }
    }
  };

  // [api/orders] : create new order
  router.post("/", (req, res) => {
    if (!req.body) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }
    
    // request body validation
    let errors = validate(req.body, newOrderConstraints);
    
    // check order items
    if (req.body.order && req.body.order) {
      req.body.order.items.forEach((item) => {
        const newErrors = validate(item, orderItemConstraints);
        if (errors) {
          // add to errors
          Object.assign(errors, newErrors);
        } else {
          errors = newErrors;
        }
      });
    }
    
    // check payment
    let payment = req.body.payment;
    if (payment && payment.type && payment.type === "credit") {
      const newErrors = validate(req.body, creditCardPaymentConstraints);
      if (errors) {
        // add to errors
        Object.assign(errors, newErrors);
      } else {
        errors = newErrors;
      }
    }
    
    if (errors) {
      return res.status(400).json(errors);
    }
    
    let items = req.body.order.items;
    let specialRequests = req.body.order.special_requests;
    let restaurantId = req.body.order.restaurant_id;
    let name = req.body.contact.name;
    let phone = req.body.contact.phone;
    let paymentType = req.body.payment.type;
    let cardNo;
    let cardCsc;
    let cardExpiry;
    let email = ""; // TODO ??? for email
    // TODO need to calculate this server-side
    let min = req.body.order.min; // completion time in minutes

    if (paymentType === 'credit') { // card
      cardNo = payment.credit.card_no;
      cardCsc = payment.credit.card_csc;
      // TODO need to turn this into date
      cardExpiry = payment.credit.card_expiry;
    } else if (paymentType === 'debit') {
      // TODO
    }

    if (errors) {
      return res.status(400).json(errors);
    }

    // extract all item ids
    let itemsIds = items.map((item) => item.id);

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
      // calculate total price
      let totalPrice = items.reduce((total, current) => {
        return total + Number(current.price * current.qty);
      }, 0);

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
      };

      let customer = {
        name: name,
        phone: phone,
        email: email
      };

      let orderItems = [];

      for (let idx in items) {
        console.log(items[idx]);
        let data = {
          inventory_id: items[idx].id,
          qty: items[idx].qty
        };
        orderItems.push(data);
      }

      // insert order to table
      return OrderHelper.insertOrder(order, customer, orderItems, payment);
    }).then((order_id) => {
      res.status(201).send({order_id});
    }).catch((err) => {
      res.status(500).json({ error: err.message });
    });
  });

  return router;
};
