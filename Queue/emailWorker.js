const { Worker } = require("bullmq");
const redisConnection = require("../Config/RedisConfig");
const EmailService = require("../Common/EmailService");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

// Maps each job type to the correct EmailService function
const handlers = {
  otp: ({ email, code, type }) =>
    EmailService.sendOtpEmail(email, code, type),

  "password-reset-link": ({ email, name, url }) =>
    EmailService.sendPasswordResetEmail(email, name, url),

  "password-reset-confirm": ({ email, name }) =>
    EmailService.sendPasswordResetConfirm(email, name),

  "contact-admin": ({ name, email, message, createdAt }) =>
    EmailService.sendContactNotification(ADMIN_EMAIL, { name, email, message, createdAt }),

  "contact-user": ({ email, name }) =>
    EmailService.sendContactConfirmation(email, name),

  "report-issue": ({ issueType, description, createdAt }) =>
    EmailService.sendReportIssueNotification(ADMIN_EMAIL, { issueType, description, createdAt }),
};

const worker = new Worker(
  "email",
  async (job) => {
    const { type, payload } = job.data;
    const handler = handlers[type];
    if (!handler) throw new Error(`Unknown email job type: "${type}"`);
    await handler(payload);
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[EmailWorker] ✓ ${job.data.type} (job ${job.id})`);
});

worker.on("failed", (job, err) => {
  const attempt = job?.attemptsMade ?? "?";
  const max = job?.opts?.attempts ?? 3;
  console.error(
    `[EmailWorker] ✗ ${job?.data?.type} (job ${job?.id}) attempt ${attempt}/${max}: ${err.message}`
  );
});

module.exports = worker;
