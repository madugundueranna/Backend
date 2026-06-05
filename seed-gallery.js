// Backend/seed-gallery.js
// Uploads 3 Cloudinary gallery photos to every event that currently has no gallery.
// Safe to re-run — skips events that already have gallery images.
// Usage: node seed-gallery.js

require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const Event = require("./Models/Events/EventModel");
require("./Config/DBConnect");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 3 curated Unsplash images per event type (all URLs verified working)
const GALLERY_BY_TYPE = {
  "Music": [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  ],
  "Technology": [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  ],
  "Comedy": [
    "https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
  ],
  "Fashion": [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
  ],
  "Conference": [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
  ],
  "Business": [
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
  ],
  "Networking": [
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
  ],
  "Gaming": [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
  ],
  "Workshop": [
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  ],
  "Seminar": [
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  ],
  "Festival": [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
  ],
  "Health & Wellness": [
    "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  ],
  "Sports": [
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80",
  ],
  "Arts & Culture": [
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  ],
  "Family & Kids": [
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80",
    "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=800&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  ],
  "Theatre": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  ],
  "Film & Media": [
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
  ],
  "Food & Drink": [
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  ],
  "Charity & Fundraising": [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
  ],
  "Education": [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
  ],
};

// Fallback for any unrecognised type
const DEFAULT_GALLERY = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
];

async function uploadImage(sourceUrl) {
  const result = await cloudinary.uploader.upload(sourceUrl, {
    folder: "qreventix/events/gallery",
    resource_type: "image",
    quality: "auto",
  });
  return { url: result.secure_url, publicId: result.public_id };
}

async function seedGallery() {
  await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) resolve();
    else mongoose.connection.once("connected", resolve);
  });

  console.log("\n=== QREventix — Gallery Seeder ===\n");

  // Only process events that have no gallery images yet
  const events = await Event.find({ "gallery.0": { $exists: false } })
    .select("_id title type")
    .lean();

  if (events.length === 0) {
    console.log("All events already have gallery images. Nothing to seed.");
    process.exit(0);
  }

  console.log(`Seeding gallery for ${events.length} event(s)...\n`);
  let successCount = 0;
  let failCount = 0;

  for (const ev of events) {
    const urls = GALLERY_BY_TYPE[ev.type] || DEFAULT_GALLERY;
    const gallery = [];

    console.log(`  📸 "${ev.title}" [${ev.type}]`);

    for (const url of urls) {
      try {
        const img = await uploadImage(url);
        gallery.push(img);
        console.log(`     ✅ ${img.publicId}`);
      } catch (err) {
        console.log(`     ❌ failed (${url.split("/").pop().split("?")[0]}): ${err.message}`);
      }
    }

    if (gallery.length > 0) {
      await Event.updateOne({ _id: ev._id }, { $set: { gallery } });
      console.log(`     → ${gallery.length} photo(s) saved\n`);
      successCount++;
    } else {
      console.log(`     ⚠️  All uploads failed — gallery not updated\n`);
      failCount++;
    }
  }

  const line = "=".repeat(50);
  console.log(line);
  console.log("GALLERY SEED COMPLETE");
  console.log(`  Events updated : ${successCount}`);
  console.log(`  Events skipped : ${failCount}`);
  console.log(`  Total processed: ${events.length}`);
  console.log(line);
  process.exit(0);
}

seedGallery().catch((err) => {
  console.error("Gallery seed failed:", err);
  process.exit(1);
});
