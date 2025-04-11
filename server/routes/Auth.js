const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

dotenv.config();
const router = express.Router();

const qrCodeDir = path.join(__dirname, "../qrcodes");
if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir, { recursive: true });
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});


async function verifyRecaptcha(token) {
    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
        );
        return response.data.success;
    } catch (error) {
        return false;
    } 
}

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            studentNumber,
            branch,
            phoneNumber,
            hostler_dayscholar,
            recaptchaToken
        } = req.body;

        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) return res.status(400).json({ message: "reCAPTCHA verification failed!" });

        const existingUser = await User.findOne({
            $or: [
                { email },
                { studentNumber },
                { phoneNumber }
            ]
        });
        if (existingUser) {
            return res.status(400).json({ message: "User with provided email, student number or phone already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const useruuid = uuidv4();

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            uuid: useruuid,
            studentNumber,
            branch,
            phoneNumber,
            hostler_dayscholar
        });
        await newUser.save();

        const qrCodeData = await QRCode.toDataURL(useruuid);

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Event Registration Successful - Your QR Code",
            html: `<h3>Welcome, ${name}!</h3><p>Your registration is successful. Here is your QR code:</p><img src="${qrCodeData}" />`,
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "User registered successfully. QR Code sent to email." });

    } catch (error) {
        res.status(500).json({ message: "Registration failed", error });
    }
});





module.exports = router;
