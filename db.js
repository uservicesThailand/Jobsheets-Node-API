require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false // สำหรับเริ่มต้น ลองเปิดเชื่อมต่อได้ก่อน
  }
});

db.connect((err) => {
  if (err) {
    console.error('เชื่อมต่อฐานข้อมูลล้มเหลว:', err);
  } else {
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
  }
});

module.exports = db;
