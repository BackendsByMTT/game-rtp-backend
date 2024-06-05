var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
const nodemailer = require("nodemailer");
const userModel = require("../user/userModel");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();
app.use(express.json());
// Dummy user data (you would fetch this from your database)
const users = [
    { id: 1, email: "user@example.com", password: "userpassword" },
    // Add more users as needed
];
// Store the generated OTPs temporarily (you may use a database in a real application)
const otpStore = {};
// Route to send OTP to user's email
const sendOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { username, email } = req.body;
    const user = yield userModel.findOne({ username });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    if (user.email !== email)
        return res.status(400).json({ error: "Incorrect email for the user" });
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}`,
    };
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ error: "Failed to send OTP" });
        }
        else {
            console.log("Email sent: " + info.response);
            return res.status(200).json({ message: "OTP sent successfully" });
        }
    });
});
// Route to reset password using OTP
const otpVerification = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { email, otp } = req.body;
    if (otp !== otpStore[email]) {
        return res.status(400).json({ error: "Invalid OTP" });
    }
    else {
        return res.status(200).json({ message: "OTP successfully verified" });
    }
});
const resetPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { username, email, newPassword } = req.body;
    const ChangedPassword = yield bcrypt.hash(newPassword, 10);
    const updatedUser = yield userModel.findOneAndUpdate({ username }, { password: ChangedPassword }, { new: true });
    if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
    }
    // Remove the OTP from the store as it is no longer needed
    delete otpStore[email];
    return res.status(200).json({ message: "Password reset successfully" });
});
module.exports = { resetPassword, sendOtp, otpVerification };
