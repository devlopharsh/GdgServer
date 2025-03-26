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

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, captchaToken } = req.body;

        const captchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
        );

        if (!captchaResponse.data.success) {
            return res.status(400).json({ message: "CAPTCHA verification failed!" });
        }
s
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const useruuid = uuidv4();

        const newUser = new User({ name, email, password: hashedPassword, uuid: useruuid });
        await newUser.save();

        const qrCodePath = path.join(qrCodeDir, `${useruuid}.png`);

        await QRCode.toFile(qrCodePath, useruuid);

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Event Registration Successful - Your QR Code",
            html: `
                <h3>Welcome, ${name}!</h3>
                <p>Here is your unique QR Code for event attendance:</p>
                <img src="cid:qrcode" alt="Your QR Code"/>
            `,
            attachments: [
                {
                    filename: "qrcode.png",
                    path: qrCodePath,
                    cid: "qrcode", 
                },
            ],
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending email:", err);
                return res.status(500).json({ message: "Error sending email", error: err });
            } else {
                console.log("QR Code email sent successfully:", info.response);

                fs.unlink(qrCodePath, (err) => {
                    if (err) console.error("Error deleting QR Code file:", err);
                });

                return res.status(201).json({ message: "User registered successfully. QR Code sent to email." });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;