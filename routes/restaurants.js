"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (DataHelper) => {

  router.get("/", (req, res) => {
    DataHelper.getRestaurants()
      .then((restaurants) => {
        res.json(restaurants);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  router.get("/:id", (req, res) => {
    let id = req.params.id;
    DataHelper.getRestaurantById(id)
      .then((restaurant) => {
        res.json(restaurant);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });
  return router;
};
