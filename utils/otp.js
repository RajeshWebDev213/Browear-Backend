const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const { text } = require("body-parser");
dotenv.config()
const otpStore = {}

const SendOTP = async (email)=>{
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = otp;

   const Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.Email,
    pass: process.env.Pass
  }
});
    const Mailoptions = {
        from:process.env.Email,
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