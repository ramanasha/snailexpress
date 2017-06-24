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

  return router;
}
