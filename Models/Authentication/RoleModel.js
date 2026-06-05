const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require("moment-timezone");

// ─── Schema Definition ────────────────────────────────────────────────────────
const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: ""
    },
    email: { type: String, default: "", lowercase: true },
    companyName: { type: String, default: "" },
    password: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      default: "User",
      enum: ["User", "Organizer", "Admin"],
    },
    isAgency: {
      type: Boolean,
      default: false
    },
    mobileNumber: {
      type: String,
      default: "",
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
    },
    tokenVersion: { type: Number, default: 0 },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    createdDate: { type: String, default: "" },
    updatedDate: { type: String, default: "" },
  },
  {
    collection: "Roles",
    versionKey: false,
  }
);

// ─── Pre-Save Hook: Hash Password + Set Timestamps ───────────────────────────
authSchema.pre("save", async function () {
  const currentISTDateString = moment
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss");

  // Set timestamps
  if (this.isNew) {
    this.createdDate = currentISTDateString;
  }
  this.updatedDate = currentISTDateString;

  // Hash password only if it was modified and is non-empty
  if (!this.isModified("password") || !this.password) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// ─── Token Generation ─────────────────────────────────────────────────────────
authSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id, role: this.role, tokenVersion: this.tokenVersion },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );
    return `Bearer ${token}`;
  } catch (error) {
    console.error("Token Generation Error:", error);
    throw new Error("Token generation error");
  }
};

const roleModel = mongoose.model("Roles", authSchema);

module.exports = roleModel;
