// Redis connection config for BullMQ (ioredis options)
// BullMQ creates its own connections from this object — do NOT pass a shared client.
const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null, // required by BullMQ
};

if (process.env.REDIS_PASSWORD) {
  redisConnection.password = process.env.REDIS_PASSWORD;
}

module.exports = redisConnection;
