"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (DataHelper) => {

  router.get("/", (req, res) => {
    DataHelper.getUsers((err, users) => {
      if(err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(users);
      }
    });
  });

  return router;
}
