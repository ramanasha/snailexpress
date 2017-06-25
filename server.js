"use strict";

require('dotenv').config();

const PORT          = process.env.PORT || 8080;
const ENV           = process.env.ENV || "development";
const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) throw new Error("COOKIE_SECRET environment variable required");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) throw new Error("GOOGLE_MAPS_API_KEY environment variable required");

const express       = require("express");
const bodyParser    = require("body-parser");
const sass          = require("node-sass-middleware");
const app           = express();

const knexConfig    = require("./knexfile");
const knex          = require("knex")(knexConfig[ENV]);
const morgan        = require('morgan');
const knexLogger    = require('knex-logger');
const flash         = require('connect-flash');

const bcrypt        = require('bcrypt-nodejs');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const method        = require("method-override");

// Seperated Routes for each Resource
const usersRoutes   = require("./routes/users");
const customersRoutes = require("./routes/customers");
const feedbacksRoutes = require("./routes/feedbacks");
const inventoriesRoutes = require("./routes/inventories");
const ordersRoutes   = require("./routes/orders");
const restaurantsRoutes = require("./routes/restaurants");

//some test example users
let users = {
  "userRandomID": {
    name: "User 1",
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("test1")
  },
 "user2RandomID": {
    name: "User 2",
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("test2")
  }
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

//set cookie sessions to remember users for 24 hours
app.use(cookieParser(COOKIE_SECRET));
app.use(cookieSession({
  name: "session",
  secret: COOKIE_SECRET,
  maxAge: 24 * 60 * 60 * 1000 // cookie expires in 24 hours
}));
//use flash messages
app.use(flash());

app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded',
  includePaths: [
    __dirname + '/node_modules/foundation-sites/assets/',
    __dirname + '/node_modules/foundation-sites/scss/'
  ]
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

function createTemplateVars(req, templateVars = {}) {
  templateVars.user = users[req.session.user_id];
  templateVars.messages = req.flash('messages');
  templateVars.googleMapsAPIKey = GOOGLE_MAPS_API_KEY;
  return templateVars;
}

// Home page
app.get("/", (req, res) => {

  //cart on left of main page after scrolling down
  const cartCookie = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  const cartIds = cartCookie.map((item) => item.inventoryId);

  const cartQuantity = cartCookie.reduce((memo, item) => {
    memo[item.inventoryId] = item.quantity;
    return memo;
  }, {});

  const cartInventory = InventoryDataHelper.getInventoryByIds(cartIds)
    .then((items) => {
      return items.map((item) => {
        item.quantity = cartQuantity[item.id];
        return item;
      });
    });
  //inventory items to show on main page
  const allInventory = InventoryDataHelper.getInventories();

  Promise.all([cartInventory, allInventory])
    .then(([cartInventory, allInventory]) => {
      res.render("index", createTemplateVars(req, {
        items: allInventory,
        cart: cartInventory
      }));
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

//checkout page
app.get("/checkout", (req, res) => {
  const cartCookie = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  const cartIds = cartCookie.map((item) => item.inventoryId);

  const cartQuantity = cartCookie.reduce((memo, item) => {
    memo[item.inventoryId] = item.quantity;
    return memo;
  }, {});

  console.log("cart Ids: ", cartIds);

  InventoryDataHelper.getInventoryByIds(cartIds)
    .then((items) => {
      items = items.map((item) => {
        item.quantity = cartQuantity[item.id];
        return item;
      });

      // FIXME make sure we don't have negative stock
      console.log(items);
      const subtotal = items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0).toFixed(2);
      const total = (subtotal * 1.13).toFixed(2);
      res.render("checkout", createTemplateVars(req, {
        cart: items,
        subtotal,
        total
      }));
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });

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
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    req.flash('messages', 'Please enter email and/or password.');
    return res.redirect('/login');
  }
  for (let key in users) {
    if (email === users[key].email && bcrypt.compareSync(password, users[key].password)) {
      req.session.user_id = key;
      req.flash('messages', 'login is a success!');
      return res.redirect("/");
    }
  }
  req.flash('messages', 'Incorrect email and/or password!');
  return res.redirect('/login');
});

app.post("/logout", (req, res) => {
  //logout to remove cookie session with the user_id.
  req.session.user_id = null;
  req.flash('messages', 'logout is a success!');
  return res.redirect("/");
});

app.post("/register", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let user_id = email;
  // Did they enter an e-mail address or password?
  if (!email || !password) {
    req.flash('messages', 'Email or password not entered.');
    return res.redirect('/register');
  }
  // Checking if user with already exists
  for (let key in users) {
    if (email === users[key].email) {
      req.flash('messages', 'User already exists!');
      return res.redirect('/register');
    }
  }
  users[user_id] = {
    name: name,
    id: user_id,
    email: email,
    password: bcrypt.hashSync(password)
  };
  req.session.user_id = user_id;
  return res.redirect("/");
});

// order status page
app.get("/order_status", (req, res) => {
  res.render("order_status");
});

// order management page
app.get("/order_management", (req, res) => {
  OrderDataHelper.getOrders()
  .then((orders) => {
    res.render("order_management", createTemplateVars(req, {
      orders: orders
    }));
  })
});

// inventory_management page
app.get("/inventory_management", (req, res) => {
  res.render("inventory_management");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
