const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  role:  { type: String, required: true, trim: true },
  city:  { type: String, required: true, trim: true },
  bio:   { type: String, default: "", trim: true },
}, { _id: false });

const statSchema = new mongoose.Schema({
  number: { type: String, required: true },
  label:  { type: String, required: true },
}, { _id: false });

const valueSchema = new mongoose.Schema({
  icon:  { type: String, default: "FiTarget" },
  title: { type: String, required: true },
  body:  { type: String, required: true },
}, { _id: false });

const aboutSchema = new mongoose.Schema({
  heroTagline:   { type: String, default: "" },
  storyParagraphs: [{ type: String }],
  values:        [valueSchema],
  team:          [teamMemberSchema],
  stats:         [statSchema],
});

module.exports = mongoose.model("About", aboutSchema);
