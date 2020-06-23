const express = require("express");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const User = require("../models/user");
const Message = require("../models/message");
const ExpressError = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    let currUser = req.user.username;
    let message  = await Message.get(req.params.id);
    if (currUser === message.to_user.username || currUser === message.from_user.username) {
      return res.json({ message });
    }
    throw new ExpressError("Must be the to or from user to view this message", 401)
  } catch(err) {
    next(err);
  }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function(req, res, next) {
   try {
    console.log(process.env);
    const { to_username, body} = req.body;
    const from_username = req.user.username;
    const message = await Message.create({from_username, to_username, body});
    return res.json({ message });
   } catch(err) {
     next(err);
   }
 })


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function (req, res, next) {
  try {
    let currUser = req.user.username;
    let message = await Message.get(req.params.id);
    if (currUser === message.to_user.username) {
      let message = await Message.markRead(req.params.id);
      return res.json({ message });
    }
    throw new ExpressError("Must be the to user to mark as read", 401)
  } catch (err) {
    next(err);
  }
})


module.exports = router;