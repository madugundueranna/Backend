// Backend/seed-cities.js
// Run: npm run seed:cities
// Idempotent — skips cities that already exist by name.

require("dotenv").config();
const mongoose = require("mongoose");
const City = require("./Models/Cities/CityModel");

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Visakhapatnam",
  "Vijayawada",
  "Tirupati",
  "Kurnool",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Coimbatore",
  "Kochi",
  "Chandigarh",
];

async function seedCities() {
  const db = process.env.DATABASE;
  if (!db) {
    console.error("DATABASE env variable is not set.");
    process.exit(1);
  }

  await mongoose.connect(db);
  console.log("Connected to MongoDB.");

  let inserted = 0;
  let skipped = 0;

  for (const name of CITIES) {
    const exists = await City.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (exists) {
      console.log(`  skip  "${name}" (already exists)`);
      skipped++;
    } else {
      await City.create({ name });
      console.log(`  added "${name}"`);
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seedCities().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
