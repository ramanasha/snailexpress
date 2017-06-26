"use strict";

const express  = require('express');
const bodyParser = require("body-parser");
const twilio = require('twilio');

module.exports = (OrderHelper, CustomerHelper, SMSHelper, port, ownerNumber) => {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  
  
  app.post("/twilio/orders/:id/cancel", (req, res) => {
    const phone = req.body.To;
    if (phone !== ownerNumber) {
      return res.status(403).send("not authorized");
    }
    const twiml = new twilio.twiml.VoiceResponse();
    
    OrderHelper.cancel(req.params.id)
    .then(() => {
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    });
  });
  
  // [twilio/orders/:id/inform_restaurant]
  app.post("/twilio/orders/:id/inform_restaurant", (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const input = req.body.Digits;

    // respond with the current TwiML content
    function respond() {
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
    
    function promptForOrderDuration(error) {
      if (error) {
        twiml.say("You didn't enter any numbers.");
      }

      twiml.gather({
          timeout: 5,
          finishOnKey: '*'
      }).say('Enter the amount of time to complete the order using the number keys on your telephone.' +
        ' Press star to finish.');

      twiml.gather({
          timeout: 5,
          finishOnKey: '*'
      }).say('You didn\'t enter any numbers. Enter the amount of time to complete the order using the number keys on your telephone.' +
        ' Press star to finish.');
      twiml.gather({
          timeout: 5,
          finishOnKey: '*'
      }).say('You didn\'t enter any numbers. Enter the amount of time to complete the order using the number keys on your telephone.' +
        ' Press star to finish.');
      
      twiml.say("You didn't enter any numbers. This order is cancelled.");
      twiml.redirect({
        method: 'POST'
      }, `/twilio/orders/${req.params.id}/cancel`);

    }
    
    // validate input
    if (input !== undefined) {
      const minutes = Number(input);
      if (!isNaN(minutes)){
        OrderHelper.setInProgress(req.params.id, minutes)
        .then(() => {
          twiml.say('The order is now in the queue. Goodbye.');
          respond();
        });
        
      } else {
        promptForOrderDuration("error");
        respond();
      }
    } else {
      // say order information
      OrderHelper.getOrderById(req.params.id)
      .then(([order]) => {
        const customer = CustomerHelper.getCustomerById(order.customer_id);
        const order_items = OrderHelper.getOrderItems(order.order_id);
        return Promise.all([order, customer, order_items]);
      })
      .then(([order, customer, order_items]) => {
        twiml.say(`You have a new order. ${customer.name} ordered ${order_items.length} menu items.`);

        order_items.forEach((item, i) => {
          twiml.say(`Item ${i + 1}: ${item.name}, quantity: ${item.qty}, size: ${item.weight} pounds.`);
        });

        twiml.pause();

        promptForOrderDuration();
        respond();
      });
    }
  });

  app.listen(port, () => {
    console.log("Twilio server is listening on port " + port);
  });
  
  return app;
};