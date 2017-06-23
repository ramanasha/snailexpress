"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (DataHelper) => {

  router.get("/", (req, res) => {
    DataHelper.getCustomers((err, customers) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(customers);
      }
    });
  });

  router.get("/:id", (req, res) => {
    let id = req.params.id;
    DataHelper.getCustomerById(id, (err, customer) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(customer);
      }
    });
  });

  return router;
}
