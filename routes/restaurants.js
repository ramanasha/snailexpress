"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (DataHelper) => {

  router.get("/", (req, res) => {
    DataHelper.getRestaurants((err, restaurants) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(restaurants);
      }
    });
  });

  router.get("/:id", (req, res) => {
    let id = req.params.id;
    DataHelper.getRestaurantById(id, (err, restaurant) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(restaurant);
      }
    });
  });

  return router;
}
