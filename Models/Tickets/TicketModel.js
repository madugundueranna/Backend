const mongoose = require("mongoose");
const moment = require("moment-timezone");

// ─── Schema Definition ────────────────────────────────────────────────────────
const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    // UUID encoded in the QR code — never exposed in human-readable UI, only scanned
    scanToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true,
    },
    eventTitle: { type: String, default: "" },
    eventDate: { type: String, default: "" },
    eventTime: { type: String, default: "" },
    eventVenue: { type: String, default: "" },
    eventImage: { type: String, default: "" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roles",
      required: true,
    },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    tier: { type: String, default: "General" },
    price: { type: Number, default: 0 },
    priceLabel: { type: String, default: "Free" },
    status: {
      type: String,
      enum: ["Registered", "Checked-In", "Cancelled"],
      default: "Registered",
    },
    paymentId: { type: String, default: "" },
    orderId: { type: String, default: "" },
    checkedInAt: { type: String, default: "" },
    createdDate: { type: String, default: "" },
    updatedDate: { type: String, default: "" },
  },
  {
    collection: "Tickets",
    versionKey: false,
  }
);

// ─── Pre-Save Hook: Set Timestamps ───────────────────────────────────────────
ticketSchema.pre("save", function () {
  const currentISTDateString = moment
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss");

  if (this.isNew) {
    this.createdDate = currentISTDateString;
  }
  this.updatedDate = currentISTDateString;
});

const ticketModel = mongoose.model("Tickets", ticketSchema);

module.exports = ticketModel;
