const { Queue } = require("bullmq");
const redisConnection = require("../Config/RedisConfig");

const emailQueue = new Queue("email", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000, // retries at ~1 s, ~2 s, ~4 s
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

/**
 * Add an email job to the queue.
 * @param {"otp"|"password-reset-link"|"password-reset-confirm"|"contact-admin"|"contact-user"|"report-issue"} type
 * @param {object} payload  Arguments forwarded to the matching EmailService function.
 */
const dispatchEmail = (type, payload) =>
  emailQueue.add(type, { type, payload });

module.exports = { emailQueue, dispatchEmail };
