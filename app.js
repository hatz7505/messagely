// 1. env variables ?? better to have secret key in .env file or doesn't matter?
// 2. when loggin in a user, why do we want to put the password in the jwt payload?
// guess: one way hashing
// 3. how to unpack object in JS to pass into method/function
// 4. why does result.rows.length === 0 work in condition line 41 user.js
// instead of !result.rows[0].password

/** Express app for message.ly. */


const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { authenticateJWT } = require("./middleware/auth");

const ExpressError = require("./expressError")
const app = express();

// allow both form-encoded and json body parsing
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended: true}));

// allow connections to all routes from any browser
app.use(cors());

// get auth token for all routes
app.use(authenticateJWT);

/** routes */

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if (process.env.NODE_ENV != "test") console.error(err.stack);

  return res.json({
    error: err
  });
});


module.exports = app;
