const mongoose = require("mongoose");
const moment = require("moment-timezone");

const careerSchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true },
  department:       { type: String, required: true, trim: true },
  location:         { type: String, required: true, trim: true },
  type:             { type: String, required: true, trim: true },
  description:      { type: String, required: true, trim: true },
  applicationEmail: { type: String, default: "careers@qreventix.in" },
  isActive:         { type: Boolean, default: true },
  createdAt:        { type: String, default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
});

module.exports = mongoose.model("Career", careerSchema);
