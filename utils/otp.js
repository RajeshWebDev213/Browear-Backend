const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const otpStore = {};

const SendOTP = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = otp;

    await resend.emails.send({
      from: process.env.EMAIL_USER, 
      to: email,
      subject: "Your OTP Verification",
      text: `Your OTP is ${otp}`
    });
    
    console.log("OTP sent successfully to:", email);

  } catch (error) {
    console.log("Resend error:", error);
    throw error;
  }
};

const VerifyOTP = (email, otp) => {
  return otpStore[email] == otp;
};

const DeleteOTP = (email) => {
  delete otpStore[email];
};

module.exports = { SendOTP, VerifyOTP, DeleteOTP };
