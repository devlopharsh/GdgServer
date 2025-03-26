const express = require("express");
const User = require("../models/User");
const Attendee = require("../models/Attendee"); // New collection for storing attendance
const router = express.Router();

router.post("/mark-attendance", async (req, res) => {
    try {
        const { uuid } = req.body;
        
        if (!uuid) {
            return res.status(400).json({ message: "UUID is required" });
        }

        const user = await User.findOne({ uuid });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user has already attended
        const existingAttendee = await Attendee.findOne({ uuid });
        if (existingAttendee) {
            return res.status(400).json({ message: "User has already attended the event" });
        }

        // Save user details in a new collection "attendees"
        const newAttendee = new Attendee({
            name: user.name,
            email: user.email,
            uuid: user.uuid,
            timestamp: new Date()
        });
        await newAttendee.save();

        res.status(200).json({ message: "Attendance marked successfully!" });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
