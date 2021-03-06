const express = require("express");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const User = require("../models/user");
const ExpressError = require("../expressError");

const router = new express.Router();


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;

    if (await User.authenticate(username, password)) {
      let payload = { username };
      let token = jwt.sign(payload, SECRET_KEY);
      req.body._token = token;
      await User.updateLoginTimestamp(username);
      return res.json({ token });

    }
    throw new ExpressError("Invalid Credentials", 401);
  } catch (err) {
    next(err);
  }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
  try {
    let newUser = await User.register(req.body);
    let token = jwt.sign(payload = newUser.username, SECRET_KEY);
    req.body._token = token;
    await User.updateLoginTimestamp(newUser.username);
    return res.json({ token });
  } catch (err) {
    next(err);
  }
})

module.exports = router;
