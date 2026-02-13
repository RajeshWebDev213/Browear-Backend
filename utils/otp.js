const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const { text } = require("body-parser");
dotenv.config()
const otpStore = {}

const SendOTP = async (email)=>{
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = otp;

 const Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

    const Mailoptions = {
        from:process.env.EMAIL_USER,
        to: email,
        subject:"Your OTP verification",
        text:`Your OTP is ${otp}`
    }
    await Transporter.sendMail(Mailoptions)
}
const VerifyOTP = (email,otp)=>{
    return otpStore[email] == otp;
}

const DeleteOTP = (email)=>{
    delete otpStore[email];
}

module.exports = {SendOTP,VerifyOTP,DeleteOTP}