const mongoose = require("mongoose");

const DB = process.env.DATABASE;

// ─── Connection Options ───────────────────────────────────────────────────────
const connectionOptions = {
  maxPoolSize: 20,
  serverSelectionTimeoutMS: 19980,
  socketTimeoutMS: 360000,
  connectTimeoutMS: 19980,
  readPreference: "secondaryPreferred",
};

// ─── Connection Event Listeners ───────────────────────────────────────────────
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB");
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  Mongoose disconnected from MongoDB");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 Mongoose reconnected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err.message);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 Mongoose connection closed due to app termination");
  process.exit(0);
});

// ─── Connect ──────────────────────────────────────────────────────────────────
mongoose
  .connect(DB, connectionOptions)
  .catch((error) => console.error("Database Connection Error:", error));

