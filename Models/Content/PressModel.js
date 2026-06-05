const mongoose = require("mongoose");
const moment = require("moment-timezone");

const pressSchema = new mongoose.Schema({
  publication: { type: String, required: true, trim: true },
  headline:    { type: String, required: true, trim: true },
  summary:     { type: String, default: "", trim: true },
  date:        { type: String, required: true },
  logo:        { type: String, required: true },
  logoColor:   { type: String, default: "bg-slate-100 text-slate-700" },
  link:        { type: String, default: "" },
  createdAt:   { type: String, default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
});

module.exports = mongoose.model("Press", pressSchema);
