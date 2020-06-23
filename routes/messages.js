const express = require("express");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const User = require("../models/user");
const Message = require("../models/message");
const ExpressError = require("../expressError");

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

router.get('/:id', async function(req, res, next) {
  try {
    // let currUser = req.user.username;
    let toUser = (await Message.get(req.params.id)).to_user.username
    // console.log('REQ USER......', currUser);
    console.log('to user from message.......', toUser)
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

 router.post('/', function(req, res, next) {
   try {
    const { to_username, body} = req.body;
    const from_username = req.user.username;
    const message = Message.create(from_username, to_username, body);
    return res.json({ message });
   } catch(err) {
     next(err)
   }
 })


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

module.exports = router;