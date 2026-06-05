const mongoose = require("mongoose");
const moment = require("moment-timezone");

const eventCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    isActive: { type: Boolean, default: true },
    createdDate: { type: String, default: "" },
    updatedDate: { type: String, default: "" },
  },
  { collection: "EventCategories", versionKey: false }
);

eventCategorySchema.pre("save", function () {
  const now = moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
  if (this.isNew) this.createdDate = now;
  this.updatedDate = now;
});

module.exports = mongoose.model("EventCategories", eventCategorySchema);
