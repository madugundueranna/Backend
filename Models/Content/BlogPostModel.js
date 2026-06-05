const mongoose = require("mongoose");
const moment = require("moment-timezone");

const blogPostSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, trim: true, unique: true, lowercase: true },
  excerpt:     { type: String, required: true, trim: true },
  content:     { type: String, default: "" },
  author:      { type: String, required: true, trim: true },
  date:        { type: String, required: true },
  category:    { type: String, required: true, trim: true },
  readTime:    { type: String, default: "5 min read" },
  coverImage:  {
    url:       { type: String, default: "" },
    publicId:  { type: String, default: "" },
  },
  isPublished: { type: Boolean, default: true },
  createdAt:   { type: String, default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") },
});

module.exports = mongoose.model("BlogPost", blogPostSchema);
