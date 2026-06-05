const mongoose = require("mongoose");
const moment = require("moment-timezone");

const enquirySchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true, lowercase: true },
  message:   { type: String, required: true, trim: true },
  status:    { type: String, enum: ["new", "read", "resolved"], default: "new" },
  createdAt: { type: String, default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
});

module.exports = mongoose.model("Enquiry", enquirySchema);
