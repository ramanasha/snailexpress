"use strict";

require('dotenv').config();

const PORT          = process.env.PORT || 8080;
const ENV           = process.env.ENV || "development";
const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) throw new Error("COOKIE_SECRET environment variable required");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) throw new Error("GOOGLE_MAPS_API_KEY environment variable required");
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
if (!TWILIO_ACCOUNT_SID) throw new Error("TWILIO_ACCOUNT_SID environment variable required");
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
if (!TWILIO_AUTH_TOKEN) throw new Error("TWILIO_AUTH_TOKEN environment variable required");


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
app.use(express.static("node_modules/foundation-sites/dist/"));
app.use(method('_method'));

// twilio services
const twilio = require('twilio');
const twilioClient = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Data helper
const SMSHelper = require('./lib/sms-helper.js')(twilioClient);
const UserDataHelper = require("./db/helper/user-helper.js")(knex);
const CustomerDataHelper = require("./db/helper/customer-helper.js")(knex);
const FeedbackDataHelper = require("./db/helper/feedback-helper.js")(knex);
const InventoryDataHelper = require("./db/helper/inventory-helper.js")(knex);
const OrderDataHelper = require("./db/helper/order-helper.js")(knex);
const RestaurantDataHelper = require("./db/helper/restaurant-helper.js")(knex);

// Mount all resource routes
app.use("/api/users", usersRoutes(UserDataHelper));
app.use("/api/customers", customersRoutes(CustomerDataHelper));
app.use("/api/feedbacks", feedbacksRoutes(FeedbackDataHelper));
app.use("/api/inventories", inventoriesRoutes(InventoryDataHelper));
app.use("/api/orders", ordersRoutes(OrderDataHelper, InventoryDataHelper, CustomerDataHelper, SMSHelper));
app.use("/api/restaurants", restaurantsRoutes(RestaurantDataHelper));

function createTemplateVars(req, templateVars = {}) {
  templateVars.user = req.session.user_id;
  templateVars.messages = req.flash('messages');
  templateVars.googleMapsAPIKey = GOOGLE_MAPS_API_KEY;
  return templateVars;
}

// Home page
app.get("/", (req, res) => {

  //see cart.js client side for cart code
  //cart will be shown on the left of inventory

  //INVENTORY
  InventoryDataHelper.getInventories()
    .then((items) => {
      items.sort((a, b) => a.name > b.name);
      res.render("index", createTemplateVars(req, {
        items,
      }));
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
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    req.flash('messages', 'Please enter email and/or password.');
    return res.redirect('/login');
  }

  UserDataHelper.getUserByEmail(email)
  .then((user) => {
    if (user.length > 0) {
      if (bcrypt.compareSync(password, user[0].password)) {
        req.session.user_id = user[0].email;
        req.flash('messages', 'login is a success!');
        return res.redirect("/");
      } else {
        req.flash('messages', 'Incorrect password!');
        return res.redirect('/login');
      }
    } else {
      req.flash('messages', 'Incorrect email!');
      return res.redirect('/login');
    }
  });
});

app.post("/logout", (req, res) => {
  //logout to remove cookie session with the user_id.
  req.session.user_id = undefined;
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
  UserDataHelper.getUserByEmail(email)
  .then((result) => {
    if (result.length > 0) {
       req.flash('messages', 'User already exists!');
      return res.redirect('/register');
    } else {
      let user = {
        name: name,
        email: email,
        password: bcrypt.hashSync(password)
      };

      UserDataHelper.insertUser(user)
      .catch((err) => {
        console.log(err);
      });
      req.session.user_id = user_id;
      return res.redirect("/");
    }
  });
});

// order status page
app.get("/order_status/:id", (req, res) => {
  OrderDataHelper.getOrderById(req.params.id)
  .then(([order]) => {
    if (!order) {
      return res.status(404).send("page not found");
    }
    console.log(order);
    const order_items = OrderDataHelper.getOrderItems(req.params.id);
    const order_customer = CustomerDataHelper.getCustomerById(order.customer_id);
    return Promise.all([order, order_items, order_customer]);
  })
  .then(([order, order_items, order_customer]) => {
    console.log(order);
    res.render("order_status", createTemplateVars(req, {
      order,
      order_items,
      order_customer
    }));
  });
});

// order management page
app.get("/order_management", (req, res) => {
  OrderDataHelper.getOrders()
  .then((orders) => {
    res.render("order_management", createTemplateVars(req, {
      orders: orders
    }));
  });
});

// inventory_management page
app.get("/inventory_management", (req, res) => {
  InventoryDataHelper.getInventories()
  .then((inventory) => {
    res.render("inventory_management", createTemplateVars(req, {
      inventory: inventory
    }));
  });
});

app.post("/inventory_management", (req, res) => {
  InventoryDataHelper.getInventories()
  .then((inventory) => {
    res.render("inventory_management", createTemplateVars(req, {
      inventory: inventory
    }));
  });
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
