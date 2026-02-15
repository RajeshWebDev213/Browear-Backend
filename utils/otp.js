const nodemailer = require("nodemailer");

const otpStore = {};

//  Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= SEND OTP =================
const SendOTP = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = otp;

    await transporter.sendMail({
      from: `"BroWear" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Verification",
      text: `Your OTP is ${otp}`,
      html: `
        <h2>BroWear Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire soon.</p>
      `,
    });

  } catch (error) {
    console.error("SMTP ERROR:", error);
    throw error;
  }
};

// ================= VERIFY OTP =================
const VerifyOTP = (email, otp) => {
  return otpStore[email] == otp;
};

// ================= DELETE OTP =================
const DeleteOTP = (email) => {
  delete otpStore[email];
};

module.exports = { SendOTP, VerifyOTP, DeleteOTP };
