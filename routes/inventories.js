"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (DataHelper) => {

  router.get("/", (req, res) => {
    DataHelper.getInventories((err, inventories) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(inventories);
      }
    });
  });

  router.get("/:name", (req, res) => {
    if (!req.params) {
      res.status(400).json({ error: 'invalid request: no data in parameter'});
      return;
    }

    let name = req.params.name;

    DataHelper.getInventoryByName(name, (err, inventories) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(inventories);
      }
    });
  });

  return router;
}
