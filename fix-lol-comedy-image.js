// Run: node fix-lol-comedy-image.js
// Patches the LOL Comedy Night Bandra event image in MongoDB.
require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./Models/Events/EventModel");

async function fix() {
  await mongoose.connect(process.env.DATABASE);
  const result = await Event.updateOne(
    { title: "LOL Comedy Night Bandra" },
    { $set: { image: "https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800&q=80" } }
  );
  console.log(result.matchedCount ? "✅ Image updated." : "❌ Event not found.");
  await mongoose.disconnect();
}

fix().catch((e) => { console.error(e); process.exit(1); });
