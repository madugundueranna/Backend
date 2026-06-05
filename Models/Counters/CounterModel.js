const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String },
    seq: { type: Number, default: 0 },
  },
  { collection: "Counters", versionKey: false }
);

module.exports = mongoose.model("Counters", counterSchema);
