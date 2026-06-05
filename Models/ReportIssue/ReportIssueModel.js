const mongoose = require("mongoose");
const moment = require("moment-timezone");

const reportIssueSchema = new mongoose.Schema({
  issueType:   { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  screenshot:  { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
  status:      { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
  createdAt:   { type: String, default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
});

module.exports = mongoose.model("ReportIssue", reportIssueSchema);
