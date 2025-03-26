const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    uuid: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attendee", attendeeSchema);
