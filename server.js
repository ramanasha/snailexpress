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

const bcrypt = require('bcrypt-nodejs');
const cookieSession = require('cookie-session')
const method      = require("method-override");

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const customersRoutes = require("./routes/customers");
const feedbacksRoutes = require("./routes/feedbacks");
const inventoriesRoutes = require("./routes/inventories");
const ordersRoutes = require("./routes/orders");
const restaurantsRoutes = require("./routes/restaurants");

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("test1")
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("test2")
  }
}

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

app.set("view engine", "ejs");
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

function createTemplateVars(req) {
  return {
    user: users[req.session.user_id]
  };
}

// Home page
app.get("/", (req, res) => {
  res.render("index", createTemplateVars(req));
});

//checkout page
app.get("/checkout", (req, res) => {
  res.render("checkout", createTemplateVars(req));
});

//login and registration
app.get("/login", (req, res) => {
  let templateVars = createTemplateVars(req);
  if (templateVars.user) {
    res.redirect("/");
  } else {
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  res.render("register", createTemplateVars(req));
});

//APP POST//
app.post("/login", (req, res) =>{
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please enter email and/or password.");
  }
  for (let key in users) {
    if (email === users[key].email && bcrypt.compareSync(password, users[key].password)) {
      req.session.user_id = key;
      return res.redirect("/");
    }
  }
  res.status(403).send("Incorrect email and/or password.");
})

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user_id = randomPass(email);
  // Did they enter an e-mail address or password?
  if (!email || !password) {
    return res.status(400).send("Please enter email and/or password.");
  }
  // Checking if user with already exists
  for (let key in users) {
    if (email === users[key].email) {
      return res.status(400).send("User already exists!");
    }
  }
  users[user_id] = {
    id: user_id,
    email: email,
    password: bcrypt.hashSync(password)
  };
  req.session.user_id = user_id;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});

function generateRandomString() {
  var randomString = "";
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let stringLength = 6;

  function pickRandom() {
    return chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString = Array.apply(null, Array(stringLength)).map(pickRandom).join('');
}
