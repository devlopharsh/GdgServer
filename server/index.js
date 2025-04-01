const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/Auth");
const attendanceRoutes = require("./routes/Attendance");

dotenv.config();
const app = express();

app.use(express.json());

app.use(cors({
    origin: ["https://e-commerce-revispy.vercel.app", "http://localhost:5173"], 
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.listen(5000, () => console.log("Server running on port 5000"));

app.use("/api/Auth", authRoutes);
app.use("/", attendanceRoutes);
