const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    studentNumber: { type: String, required: true , unique : true },
    branch: { type: String, required: true },
    phoneNumber: { type: String, required: true , unique : true},
    hostler_dayscholar :{type: String, required: true},
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);