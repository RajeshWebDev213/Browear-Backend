const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const Database = mysql.createPool(process.env.MYSQL_PUBLIC_URL);


Database.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connected successfully");
    connection.release();
  }
});

module.exports = { Database };
