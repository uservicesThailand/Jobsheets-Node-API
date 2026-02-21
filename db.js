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

// Database connection pool 2
const db2 = mysql.createPool({
  host: process.env.DB2_HOST || process.env.DB_HOST, // ใช้ host เดียวกันหรือต่างกันได้
  user: process.env.DB2_USERNAME || process.env.DB_USERNAME,
  password: process.env.DB2_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.DB2_DATABASE, // database name ต่างกัน
  connectionLimit: 10,
  connectTimeout: 20000, // 20 วินาที
  ssl: {
    rejectUnauthorized: false
  }
});

const db3 = mysql.createPool({
  host: process.env.DB3_HOST,
  user: process.env.DB3_USERNAME,
  password: process.env.DB3_PASSWORD,
  database: process.env.DB3_DATABASE,
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


db2.on('error', (err) => {
  console.error('Database 2 error:', err.code);
});


db3.on('error', (err) => {
  console.error('Database 2 error:', err.code);
});

// รองรับ callback
module.exports = {
  db,
  db2,
  db3
};