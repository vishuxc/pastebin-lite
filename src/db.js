const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: process.env.DB_NAME || 'pastebin_lite',
});

module.exports = pool;
