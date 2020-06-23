/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql:///messagely_test"
  : "postgresql:///messagely";

const SECRET_KEY = process.env.SECRET_KEY || "harrynjonathan";

const BCRYPT_WORK_FACTOR = 12;


// for twilio api
const ACCT_SID = "AC6b9d063aabdea5a6db94f2796c6035f4";
const AUTH_TOKEN = "76694bc048e1d5a17109fcf923f1a62f";
const TWILIO_NUMBER = "+12058786392";



module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
  ACCT_SID,
  AUTH_TOKEN, 
  TWILIO_NUMBER
};