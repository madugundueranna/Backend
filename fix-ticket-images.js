/**
 * One-time migration: fix tickets where eventImage was stored as "[object Object]"
 * due to event.image being an object { url, publicId } instead of a plain string.
 *
 * Run with: node Backend/fix-ticket-images.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ticketModel = require("./Models/Tickets/TicketModel");
const eventModel = require("./Models/Events/EventModel");

async function run() {
  await mongoose.connect(process.env.DATABASE);
  console.log("Connected to DB");

  const badTickets = await ticketModel.find({ eventImage: "[object Object]" });
  console.log(`Found ${badTickets.length} tickets to fix`);

  let fixed = 0;
  for (const ticket of badTickets) {
    const event = await eventModel.findById(ticket.eventId).select("image");
    const imageUrl = event?.image?.url || "";
    await ticketModel.updateOne({ _id: ticket._id }, { eventImage: imageUrl });
    fixed++;
    console.log(`Fixed ticket ${ticket.ticketId} → ${imageUrl || "(no image)"}`);
  }

  console.log(`Done. Fixed ${fixed} tickets.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
