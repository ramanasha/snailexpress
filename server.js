"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');
const method      = require("method-override");
const cookieSes   = require('cookie-session');
// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const customersRoutes = require("./routes/customers");
const feedbacksRoutes = require("./routes/feedbacks");
const inventoriesRoutes = require("./routes/inventories");
const ordersRoutes = require("./routes/orders");
const restaurantsRoutes = require("./routes/restaurants");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(cookieSes({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded',
  includePaths: [__dirname + '/node_modules/foundation-sites/assets/']
}));
app.use(express.static("public"));
app.use(method('_method'));

// Data helper
const UserDataHelper = require("./db/helper/user-helper.js")(knex);
const CustomerDataHelper = require("./db/helper/customer-helper.js")(knex);
const FeedbackDataHelper = require("./db/helper/feedback-helper.js")(knex);
const InventoryDataHelper = require("./db/helper/inventory-helper.js")(knex);
const OrderDataHelper = require("./db/helper/order-helper.js")(knex);
const RestaurantDataHelper = require("./db/helper/restaurant-helper.js")(knex);
app.use(express.static("node_modules/foundation-sites/dist/"));

// Mount all resource routes
app.use("/api/users", usersRoutes(UserDataHelper));
app.use("/api/customers", customersRoutes(CustomerDataHelper));
app.use("/api/feedbacks", feedbacksRoutes(FeedbackDataHelper));
app.use("/api/inventories", inventoriesRoutes(InventoryDataHelper));
app.use("/api/orders", ordersRoutes(OrderDataHelper, InventoryDataHelper));
app.use("/api/restaurants", restaurantsRoutes(RestaurantDataHelper));

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

//checkout page
app.get("/checkout", (req, res) => {
  res.render("checkout");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
