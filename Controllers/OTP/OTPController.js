const moment = require("moment-timezone");
const OtpModel = require("../../Models/OTP/OtpModel");
const roleModel = require("../../Models/Authentication/RoleModel");
const { dispatchEmail } = require("../../Queue/emailQueue");
const { sendErrorResponse, sendSuccessResponse } = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

// Common disposable / temp-mail domains
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.info", "guerrillamail.biz",
  "guerrillamail.de", "guerrillamail.net", "guerrillamail.org", "sharklasers.com",
  "spam4.me", "trashmail.com", "trashmail.at", "trashmail.io", "trashmail.me",
  "trashmail.net", "dispostable.com", "maildrop.cc", "mailnull.com",
  "tempmail.com", "tempmail.net", "tempmail.org", "temp-mail.org",
  "10minutemail.com", "10minutemail.net", "mailnesia.com", "fakeinbox.com",
  "getnada.com", "mailsac.com", "spamgourmet.com", "discard.email",
  "getairmail.com", "throwam.com", "throwaway.email", "yopmail.com",
  "yopmail.fr", "cool.fr.nf", "jetable.fr.nf", "nospam.ze.tc",
  "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr", "courriel.fr.nf",
  "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf",
  "mailnull.com", "spamfree24.org", "trbvm.com", "trashmail.io",
  "emkei.cz", "spamgourmet.net", "spamgourmet.org",
]);

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  const { email, type } = req.body;

  if (!email || !type) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Email and type are required.");
  }

  if (!["email-verify", "password-reset"].includes(type)) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Invalid OTP type.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Please enter a valid email address.");
  }

  const domain = normalizedEmail.split("@")[1];
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return sendErrorResponse(
      res,
      STATUS.UNPROCESSABLE_ENTITY,
      "Disposable email addresses are not allowed. Please use a permanent email."
    );
  }

  try {
    if (type === "email-verify") {
      const existing = await roleModel.findOne({ email: normalizedEmail });
      if (existing) {
        return sendErrorResponse(
          res,
          STATUS.UNPROCESSABLE_ENTITY,
          "This email is already registered. Please log in instead."
        );
      }
    }

    if (type === "password-reset") {
      const user = await roleModel.findOne({ email: normalizedEmail });
      if (!user) {
        // Prevent email enumeration — always return success
        return sendSuccessResponse(res, STATUS.OK, "If this email is registered, an OTP has been sent.", null, "data");
      }
      if (user.authProvider === "google") {
        return sendErrorResponse(
          res,
          STATUS.BAD_REQUEST,
          "This account uses Google Sign-In. Please log in with Google."
        );
      }
    }

    // Delete any existing OTPs for this email + type before creating a new one
    await OtpModel.deleteMany({ email: normalizedEmail, type });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OtpModel.create({
      email: normalizedEmail,
      code,
      type,
      verified: false,
      expiresAt,
      createdDate: moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
    });

    await dispatchEmail("otp", { email: normalizedEmail, code, type });

    return sendSuccessResponse(res, STATUS.OK, "OTP sent successfully. Check your inbox.", null, "data");
  } catch (err) {
    console.error("Send OTP Error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to send OTP. Please try again.");
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  const { email, code, type } = req.body;

  if (!email || !code || !type) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Email, code, and type are required.");
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const otpRecord = await OtpModel.findOne({
      email: normalizedEmail,
      type,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return sendErrorResponse(res, STATUS.BAD_REQUEST, "OTP has expired. Please request a new one.");
    }

    if (otpRecord.code !== code.trim()) {
      return sendErrorResponse(res, STATUS.BAD_REQUEST, "Incorrect OTP. Please check and try again.");
    }

    otpRecord.verified = true;
    await otpRecord.save();

    return sendSuccessResponse(res, STATUS.OK, "Email verified successfully.", null, "data");
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to verify OTP. Please try again.");
  }
};
