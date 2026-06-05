const mongoose = require("mongoose");
const moment = require("moment-timezone");

// ─── Schema Definition ────────────────────────────────────────────────────────
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: "" },
    type: { type: String, default: "" },
    tag: { type: String, default: "" },
    city: { type: String, default: "" },
    location: { type: String, default: "" },
    venue: { type: String, default: "" },
    address: { type: String, default: "" },
    pincode: { type: String, default: "" },
    googleMapsLink: { type: String, default: "" },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    endTime: { type: String, default: "" },
    price: { type: Number, default: 0 },
    priceLabel: { type: String, default: "Free" },
    capacity: { type: Number, default: 0 },
    registered: { type: Number, default: 0 },
    expectedRegistrations: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Under Review", "Rejected", "Completed"],
      default: "Under Review",
    },
    views: { type: Number, default: 0 },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    gallery: [
      {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
      },
    ],
    amenities: [{ type: String }],
    description: { type: String, default: "" },
    tiers: [
      {
        label: { type: String },
        price: { type: Number, default: 0 },
      },
    ],
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cities",
      default: null,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventCategories",
      default: null,
      index: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roles",
      default: null,
    },
    organizerName: { type: String, default: "" },
    organizerContact: {
      name: { type: String, default: "" },
      mobile: { type: String, default: "" },
      email: { type: String, default: "" },
      bestTime: { type: String, default: "" },
    },
    eventId: { type: String, default: "", index: true },
    createdDate: { type: String, default: "" },
    updatedDate: { type: String, default: "" },
  },
  {
    collection: "Events",
    versionKey: false,
  }
);

// ─── Pre-Save Hook: Set Timestamps ───────────────────────────────────────────
eventSchema.pre("save", function () {
  const currentISTDateString = moment
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss");

  if (this.isNew) {
    this.createdDate = currentISTDateString;
  }
  this.updatedDate = currentISTDateString;
});

const eventModel = mongoose.model("Events", eventSchema);

module.exports = eventModel;
