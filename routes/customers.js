"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (DataHelper) => {

  router.get("/", (req, res) => {
    DataHelper.getCustomers()
      .then((customers) => {
        res.json(customers);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  router.get("/:id", (req, res) => {
    let id = req.params.id;
    DataHelper.getCustomerById(id)
      .then((customer) => {
        res.json(customer);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  return router;
};
