// Backend/seed-categories.js
// Run: npm run seed:categories
// Idempotent — safe to run multiple times; skips names that already exist.

require("dotenv").config();
const mongoose = require("mongoose");
const EventCategory = require("./Models/EventCategories/EventCategoryModel");

const SEED_CATEGORIES = [
  "Music",
  "Sports",
  "Business",
  "Technology",
  "Education",
  "Arts & Culture",
  "Food & Drink",
  "Health & Wellness",
  "Conference",
  "Workshop",
  "Seminar",
  "Festival",
  "Comedy",
  "Theatre",
  "Film & Media",
  "Fashion",
  "Gaming",
  "Networking",
  "Charity & Fundraising",
  "Family & Kids",
];

async function seedCategories() {
  const db = process.env.DATABASE;
  if (!db) {
    console.error("DATABASE env variable is not set.");
    process.exit(1);
  }

  await mongoose.connect(db);
  console.log("Connected to MongoDB.");

  let inserted = 0;
  let skipped = 0;

  for (const name of SEED_CATEGORIES) {
    const exists = await EventCategory.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (exists) {
      console.log(`  skip  "${name}" (already exists)`);
      skipped++;
    } else {
      await EventCategory.create({ name, isActive: true });
      console.log(`  added "${name}"`);
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seedCategories().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
