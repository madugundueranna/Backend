const mongoose = require("mongoose");

const helpFAQSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  question: { type: String, required: true, trim: true },
  answer:   { type: String, required: true, trim: true },
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("HelpFAQ", helpFAQSchema);
