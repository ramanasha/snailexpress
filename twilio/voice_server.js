"use strict";

const express  = require('express');
const twilio = require('twilio');

module.exports = (OrderHelper, CustomerHelper, SMSHelper, port) => {
  const app = express();
  
  // [twilio/orders/:id/inform_restaurant]
  app.post("/twilio/orders/:id/inform_restaurant", (req, res) => {
    //Create TwiML response
    OrderHelper.getOrderById(req.params.id)
    .then(([order]) => {
      const customer = CustomerHelper.getCustomerById(order.customer_id);
      const order_items = OrderHelper.getOrderItems(order.order_id);
      return Promise.all([order, customer, order_items]);
    })
    .then(([order, customer, order_items]) => {
      let twiml = new twilio.twiml.VoiceResponse();
      twiml.say(`You have a new order. ${customer.name} ordered ${order_items.length} menu items.`);
      
      order_items.forEach((item, i) => {
        twiml.say(`Item ${i + 1}: ${item.name}, quantity: ${item.qty}, size: ${item.weight} pounds.`);
      });
      
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
      
    });
  });

  app.listen(port, () => {
    console.log("Twilio server is listening on port " + port);
  });
  
  return app;
};