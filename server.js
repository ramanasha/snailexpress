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

function createTemplateVars(req, templateVars = {}) {
  templateVars.users = users[req.session.user_id];
  templateVars.messages = req.flash('messages');
  templateVars.googleMapsAPIKey = GOOGLE_MAPS_API_KEY;
  return templateVars;
}

// Home page
app.get("/", (req, res) => {
  res.render("index", createTemplateVars(req));
});

//checkout page
app.get("/checkout", (req, res) => {
  const cartCookie = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  const cartIds = cartCookie.map((item) => item.inventoryId);

  const cartQuantity = cartCookie.reduce((memo, item) => {
    memo[item.inventoryId] = item.quantity;
    return memo;
  }, {});

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

app.post("/", (req, res) => {
  if (!req.body) {
    res.status(400).json({ error: 'invalid request: no data in POST body'});
    return;
  }

  let items = req.body.order.items;
  let specialRequests = req.body.order.special_requests;
  let restaurantId = req.body.order.restaurant_id;
  let itemsIds = [];
  let payment = req.body.payment;
  let paymentType = req.body.payment.type;
  let name = null;
  let phone = null;
  let cardNo = null;
  let cardCsc = null;
  let cardExpiry = null;
  let email = "";
  let min = req.body.order.min;

  if (paymentType === 'credit') { // card
    name = payment.credit.name;
    phone = payment.credit.phone;
    cardNo = payment.credit.card_no;
    cardCsc = payment.credit.card_csc;
    cardExpiry = payment.credit.card_expiry;
  } else if (paymentType === 'debit') {
    name = payment.debit.name;
    phone = payment.debit.phone;
  } else if (paymentType === 'store') {
    name = payment.store.name;
    phone = payment.store.phone;
  }

  // extract all item ids
  for (let idx in items) {
    itemsIds.push(items[idx].id);
  }

  // get price infomation
  InventoryDataHelper.getPriceByIds(itemsIds)
  .then((result) => {
    // add price to item object
    for (let idx in items) {
      for (let dbIdx in result) {
        if (items[idx].id === result[dbIdx].id) {
          items[idx].price = result[dbIdx].price;
          break;
        }
      }
    }

    return items;
  }).then((items) => {
    // caculate total price
    let totalPrice = items.reduce((total, current) => {
      return Number(total.price * total.qty) + Number(current.price * current.qty);
    });

    let timeToComplete = new Date();
    timeToComplete.setMinutes(timeToComplete.getMinutes() + min);

    let order = {
      status: 'incomplete',
      start_timestamp: new Date(),
      total_price: totalPrice,
      special_requests: specialRequests,
      restaurant_id: restaurantId,
      time_to_complete: timeToComplete
    };

    let payment = {
      type: paymentType,
      card_no: cardNo,
      card_csc: cardCsc,
      card_expiry: cardExpiry
    };

    let customer = {
      phone: phone,
      email: email
    };

    let orderItems = [];

    for (let idx in items) {
      let data = {
        inventory_id: items[idx].id,
        qty: items[idx].qty
      };
      orderItems.push(data);
    }

    // insert order to table
    return OrderDataHelper.insertOrder(order, customer, orderItems, payment);
  }).then(() => {
    res.status(201).send();
  }).catch((err) => {
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

app.get("/maps", (req, res) => {
  res.render("maps", createTemplateVars(req));
});

//APP POST//
app.post("/login", (req, res) =>{
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    console.log("no email or password entered");//
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
  req.session.user_id = null;
  req.flash('messages', 'logout is a success!');
  return res.redirect("/");
});

app.post("/register", (req, res) => {
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
  res.render("order_management");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
