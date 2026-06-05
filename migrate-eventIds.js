// One-time migration: assign EVT-N eventId to every event that has none.
// Safe to re-run — skips events that already have an eventId.
// Usage: node migrate-eventIds.js

require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./Models/Events/EventModel");
const Counter = require("./Models/Counters/CounterModel");
require("./Config/DBConnect");

async function run() {
  await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) resolve();
    else mongoose.connection.once("connected", resolve);
  });

  const events = await Event.find({ eventId: { $in: ["", null] } })
    .select("_id title eventId")
    .lean();

  if (events.length === 0) {
    console.log("All events already have an eventId. Nothing to migrate.");
    process.exit(0);
  }

  console.log(`\nMigrating ${events.length} event(s) without eventId...\n`);
  let updated = 0;

  for (const ev of events) {
    const counter = await Counter.findOneAndUpdate(
      { _id: "event" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const eventId = `EVT-${counter.seq}`;
    await Event.updateOne({ _id: ev._id }, { $set: { eventId } });
    console.log(`  ✅ "${ev.title}" → ${eventId}`);
    updated++;
  }

  console.log(`\nDone. ${updated} event(s) updated.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
