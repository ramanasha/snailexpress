# SNAILS EXPRESS

Imagine this: you have a craving for gourmet snails, but you don't know where you can get this order in the fastest way possible? That's where the food ordering app, SNAILS EXPRESS, comes to the rescue! Our restaurant is conveniently located downtown, inside the Rogers Centre for pick up by using our app.

This app allows you to add item(s) to their cart, change quantity in the cart and on the main page, view your orders, checkout, and see your order status. A text will be sent to you when your order is being prepared, telling you how long the order will take.

The restaurant in turn can receive a call stating the new orders, and check online to see and modify order details, such as time it takes to prepare each order. Also, the restaurant can see and update their inventory.

This was a midterm (week 4) project at Lighthouse Labs with: Rose, Yonseung, and Steven.
Backend was built using Node.js, Express, knex, and PostreSQL
Front-end was built with Foundation, Javascript, and HTML/CSS/SASS.
Communication between customer and restaurant is done using Twilio API.
Location is set using Google Maps API.

## Screenshots

!["main page"](https://github.com/rosexw/snailexpress/blob/master/screenshots/main%20page_head%20and%20image.png)
!["checkout"](https://github.com/rosexw/snailexpress/blob/master/screenshots/checkout.png)
!["inventory management"](https://github.com/rosexw/snailexpress/blob/master/screenshots/inventory%20management.png)
!["order status"](https://github.com/rosexw/snailexpress/blob/master/screenshots/order%20status.png)

## Getting Started

1. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`
2. Update the .env file with your correct local information
3. Install dependencies: `npm i`
4. Fix to binaries for sass: `npm rebuild node-sass`
5. Run migrations: `npm run knex migrate:latest`
  - Check the migrations folder to see what gets created in the DB
6. Run the seed: `npm run knex seed:run`
  - Check the seeds file to see what gets seeded in the DB
7. Run the server: `npm run local`
8. Visit `http://localhost:8080/`

## Dependencies

- Node 5.10.x or above
- NPM 3.8.x or above
- Node dependencies:
    "bcrypt-nodejs": "0.0.3",
    "body-parser": "^1.15.2",
    "connect-flash": "^0.1.1",
    "cookie-parser": "^1.4.3",
    "cookie-session": "^2.0.0-beta.2",
    "dotenv": "^2.0.0",
    "ejs": "^2.4.1",
    "express": "^4.13.4",
    "foundation-sites": "^6.3.1",
    "knex": "^0.11.7",
    "knex-logger": "^0.1.0",
    "localtunnel": "^1.8.3",
    "method-override": "^2.3.9",
    "moment": "^2.18.1",
    "morgan": "^1.7.0",
    "multer": "^1.3.0",
    "node-sass-middleware": "^0.9.8",
    "pg": "^6.0.2",
    "twilio": "^3.4.0",
    "validate.js": "^0.11.1"
