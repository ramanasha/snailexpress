"use strict";

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const fs      = require('fs');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/products');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})

const upload  = multer({ storage: storage })

module.exports = (DataHelper) => {

  // [api/inventories]
  router.get("/", (req, res) => {
    DataHelper.getInventories()
      .then((inventories) => {
        res.json(inventories);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // [api/inventories/:name]
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

  // [api/inventories/]
  router.post("/", upload.single('product'), (req, res) => {
    if (!req.body) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }

    let inventory = req.body;
    if (req.file) {
      inventory.image = req.file.filename;
    }

    DataHelper.insertInventory(inventory)
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // [api/inventories/:id]
  router.put("/", upload.single('product'), (req, res) => {
    if (!req.body) {
      res.status(400).json({ error: 'invalid request: no data in PUT body'});
      return;
    }

    let id = req.params.id;
    let inventory = req.body;

    if (req.file) {
      inventory.image = req.file.filename;
    }

    DataHelper.updateInventory(id, inventory)
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // [api/inventories:id]
  router.delete("/:id", (req, res) => {
    let id = req.params.id;

    DataHelper.deleteInventory(id)
      .then((image) => {
        fs.unlink('public/images/products/' + image);
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  return router;
};
