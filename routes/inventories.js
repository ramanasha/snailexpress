"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (DataHelper) => {

  router.get("/", (req, res) => {
    DataHelper.getInventories()
      .then((inventories) => {
        res.json(inventories);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  router.get("/:name", (req, res) => {
    if (!req.params) {
      res.status(400).json({ error: 'invalid request: no data in parameter'});
      return;
    }

    let name = req.params.name;

    DataHelper.getInventoryByName(name)
      .then((inventory) => {
        res.json(inventory);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  return router;
};
