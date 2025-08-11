// db.js
const mysql = require('mysql2');
require('dotenv').config();


const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
  connectTimeout: 20000, // 20 วินาที
  ssl: {
    rejectUnauthorized: false
  }
});

// Optional: handle error globally
db.on('error', (err) => {
  console.error('Database error:', err.code);
});

// รองรับ callback
module.exports = db;
