/** User class for message.ly */
const bcrypt = require('bcrypt')
const { BCRYPT_WORK_FACTOR } = require('../config')
const db = require('../db');
const ExpressError = require('../expressError');

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    const hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (
              username,
              password,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at)
            VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
            RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPw, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const result = await db.query(
      `SELECT password FROM users
      WHERE username=$1`,
      [username]);
    if (result.rows.length === 0) {
      throw new ExpressError("Username does not exist", 401);
    }
    const userPw = result.rows[0].password;
    return await bcrypt.compare(password, userPw);    
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    await db.query(
      `UPDATE users SET last_login_at=current_timestamp
      WHERE username=$1
      RETURNING username, last_login_at`,
      [username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() { 
    const result = await db.query(
      ` SELECT username, first_name, last_name
      FROM users`
    );
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users WHERE username=$1`,
      [username]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }
    return result.rows[0];
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT id, body, sent_at, read_at, to_username as to_user FROM messages
      JOIN users ON messages.from_username = users.username
      WHERE users.username=$1`,
      [username]
    );
    for (let row of results.rows) {
      let result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users
      WHERE username=$1`,
      [row.to_user]);
      let toUser = result.rows[0];
      row.to_user = toUser;
    }
    return results.rows;
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const results = await db.query(
      `SELECT id, body, sent_at, read_at, from_username as from_user FROM messages
      JOIN users ON messages.to_username = users.username
      WHERE users.username=$1`,
      [username]
    );
    for (let row of results.rows) {
      let result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users
      WHERE username=$1`,
      [row.from_user]);
      let fromUser = result.rows[0];
      row.from_user = fromUser;
    }
    return results.rows;
  }
}

module.exports = User;
