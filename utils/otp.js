const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const otpStore = {};

const SendOTP = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = otp;

    await sgMail.send({
      to: email, 
      from: process.env.EMAIL_USER,
      subject: "Your OTP Verification",
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });

    console.log("OTP sent to:", email);
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    throw error;
  }
};

const VerifyOTP = (email, otp) => otpStore[email] == otp;

const DeleteOTP = (email) => delete otpStore[email];

module.exports = { SendOTP, VerifyOTP, DeleteOTP };
