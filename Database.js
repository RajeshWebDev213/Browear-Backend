const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const Database = mysql.createPool({
  host: process.env.BroWear_DB_Host,
  user: process.env.BroWear_DB_User,
  password: process.env.BroWear_DB_Password,
  database: process.env.BroWear_DB_Database,
  port: process.env.BroWear_DB_Port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


Database.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connected successfully");
    connection.release();
  }
});

module.exports = { Database };
