const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Database } = require("../Database");
const { SendOTP, VerifyOTP, DeleteOTP } = require("../utils/otp");
const { CreateToken, auth } = require("../Middleware/VerifyToken");

const router = express.Router();

/* ===========================
   SEND OTP
=========================== */
router.post("/send-otp", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    await SendOTP(email);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ===========================
   VERIFY OTP + SIGNUP
=========================== */
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

    // ✅ Check if user already exists FIRST
    const checkSql = "SELECT * FROM signupusersData WHERE email = ?";
    Database.query(checkSql, [email], async (err, result) => {
      if (err) {
        console.error("CHECK USER ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO signupusersData 
        (email, password, is_otp_verified, role)
        VALUES (?, ?, ?, ?)
      `;

      Database.query(
        insertSql,
        [email, hashedPassword, true, "user"],
        (err, insertResult) => {
          if (err) {
            console.error("INSERT USER ERROR:", err);
            return res.status(500).json({ message: "Signup failed" });
          }

          DeleteOTP(email);

          // ✅ Consistent token structure
          const token = CreateToken({
            id: insertResult.insertId,
            email,
            role: "user",
          });

          return res.json({
            message: "Signup successful",
            token,
          });
        }
      );
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   LOGIN
=========================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const sql = "SELECT * FROM signupusersData WHERE email = ?";

  Database.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("LOGIN SQL ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password incorrect" });
    }

    const token = CreateToken({
      id: user.id, // ✅ consistent
      email: user.email,
      role: user.role,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.Username || "",
        role: user.role,
      },
    });
  });
});

/* ===========================
   SAVE PERSONAL DETAILS
=========================== */
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
        return res.status(500).json({ message: "Database error" });
      }

      res.json({ message: "Personal details saved" });
    }
  );
});

/* ===========================
   PLACE ORDER
=========================== */
router.post("/orders", auth, (req, res) => {
  const user_id = req.user.id;

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
