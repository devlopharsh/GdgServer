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
const Razorpay = require("razorpay");
const crypto = require("crypto");

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

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
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

router.post("/create-order", async (req, res) => {
    try {
        const { recaptchaToken } = req.body;

        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) return res.status(400).json({ message: "reCAPTCHA verification failed!" });

        const options = {
            amount: 100 * 100, 
            currency: "INR",
            receipt: `order_rcptid_${uuidv4()}`,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);
        res.json({ orderId: order.id, currency: order.currency, amount: order.amount });
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error });
    }
});


router.post("/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, password } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid Payment Signature" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const useruuid = uuidv4();

        const newUser = new User({ name, email, password: hashedPassword, uuid: useruuid });
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
        res.status(500).json({ message: "Payment verification failed", error });
    }
});

module.exports = router;
