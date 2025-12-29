const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Vishnu@#$varthan',
  database: process.env.DB_NAME || 'pastebin_lite',
});

module.exports = pool;
