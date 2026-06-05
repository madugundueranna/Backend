const mongoose = require("mongoose");
const moment = require("moment-timezone");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    code: { type: String, required: true },
    type: {
      type: String,
      enum: ["email-verify", "password-reset"],
      required: true,
    },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    createdDate: { type: String, default: "" },
  },
  { collection: "Otps", versionKey: false }
);

// MongoDB TTL index — auto-deletes expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otps", otpSchema);
