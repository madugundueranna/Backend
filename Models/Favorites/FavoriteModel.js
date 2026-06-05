const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roles",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "Favorites",
  }
);

favoriteSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("Favorites", favoriteSchema);
