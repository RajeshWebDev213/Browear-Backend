const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Database } = require("../Database");
const { SendOTP, VerifyOTP, DeleteOTP } = require("../utils/otp");
const {CreateToken, auth } = require("../Middleware/VerifyToken");

const router = express.Router();

router.post("/send-otp", async (req, res) => {
  const { email, password } = req.body;
   console.log("Signup route hit");
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    await SendOTP(email);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({ message: "All fields required" });
    }

    const isValid = await VerifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO signupusersData (email, password, is_otp_verified, role)
      VALUES (?, ?, ?, ?)
    `;

    Database.query(
      sql,
      [email, hashedPassword, true, "user"],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "User already exists" });
        }

        DeleteOTP(email);

        const token = CreateToken({
          user_id: result.insertId,
          email,
          role: "user",
        });

        return res.json({
          message: "OTP verified & signup successful",
          token,
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM signupusersData WHERE email = ?";

  Database.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (result.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password incorrect" });
    }

    const token = CreateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.username,
        role: user.role,
      },
    });
  });
});



router.post("/personal", auth, (req, res) => {
  const { fullname, gender, dob, phonenumber } = req.body;
  const email = req.user.email;

  if (!fullname || !gender || !dob || !phonenumber) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = `
    UPDATE signupusersData
    SET Username=?, Gender=?, dateofbirth=?, phonenumber=?, is_personal_completed=?
    WHERE email=?
  `;

  Database.query(
    sql,
    [fullname, gender, dob, phonenumber, true, email],
    (err) => {
      if (err) {
        console.error("PERSONAL SQL ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json({ message: "Personal details saved" });
    }
  );
});

router.post("/orders", auth, (req, res) => {
  const user_id = req.user.id;
  console.log(user_id);
  
  if (!user_id) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const {
    ordered_name,
    phone,
    pincode,
    city,
    address,
    total_amount,
    payment_type,
  } = req.body;

  if (
    !ordered_name ||
    !phone ||
    !pincode ||
    !city ||
    !address ||
    !total_amount
  ) {
    return res.status(400).json({ message: "All fields required" });
  }

  const order_number = "ORD-" + Date.now();

  const sql = `
    INSERT INTO orders
    (user_id, order_number, ordered_name, phone, pincode, city, address, total_amount, payment_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  Database.query(
    sql,
    [
      user_id,
      order_number,
      ordered_name,
      phone,
      pincode,
      city,
      address,
      total_amount,
      payment_type || "COD",
    ],
    (err) => {
      if (err) {
        console.error("ORDER SQL ERROR:", err);
        return res.status(500).json({ message: "Order failed" });
      }
      res.json({
        message: "Order placed successfully",
        order_number,
      });
    }
  );
});

module.exports = router;
