const mongoose = require("mongoose");
const moment = require("moment-timezone");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    createdDate: { type: String, default: "" },
    updatedDate: { type: String, default: "" },
  },
  { collection: "Cities", versionKey: false }
);

citySchema.pre("save", function () {
  const now = moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
  if (this.isNew) this.createdDate = now;
  this.updatedDate = now;
});

module.exports = mongoose.model("Cities", citySchema);
