const roleModel = require("../../Models/Authentication/RoleModel");
const OtpModel = require("../../Models/OTP/OtpModel");
const {
  LOGIN_REQUIRED_FIELDS,
  ERROR_MESSAGES,
  RESPONSE_MESSAGES,
  REGISTRATION_REQUIRED_FIELDS,
} = require("../../Common/Constants");
const { getMissingFields } = require("../../Common/Validators");
const {
  sendErrorResponse,
  sendLoginSuccessResponse,
  sendCreateSuccessResponse,
  sendSuccessResponse,
} = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { dispatchEmail } = require("../../Queue/emailQueue");

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const missingFields = getMissingFields(req.body, LOGIN_REQUIRED_FIELDS);

  if (missingFields.length > 0) {
    return sendErrorResponse(
      res,
      STATUS.UNPROCESSABLE_ENTITY,
      `The following fields are required: ${missingFields.join(", ")}`
    );
  }

  try {
    const validateUser = await roleModel.findOne({ email });

    const isMatch = validateUser
      ? await bcrypt.compare(password, validateUser.password)
      : false;

    if (!validateUser || !isMatch) {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        "Invalid email or password."
      );
    }

    const token = await validateUser.generateAuthToken();
    const rawToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    res.cookie("token", rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const user = {
      ID: validateUser._id,
      name: validateUser.name,
      email: validateUser.email,
      role: validateUser.role,
    };

    return sendLoginSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.LOGIN_SUCCESS(validateUser.name),
      user
    );
  } catch (error) {
    console.error(error.message);
    return sendErrorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.LOGIN_FAILED
    );
  }
};

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password, companyName, mobileNumber, isAgency } = req.body;
  const missingFields = getMissingFields(req.body, REGISTRATION_REQUIRED_FIELDS);

  if (missingFields.length > 0) {
    return sendErrorResponse(
      res,
      STATUS.UNPROCESSABLE_ENTITY,
      `The following fields are required: ${missingFields.join(", ")}`
    );
  }

  try {
    const existingUser = await roleModel.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        ERROR_MESSAGES.ALREADY_EXISTS(existingUser.email)
      );
    }

    // Ensure email was verified via OTP before allowing registration
    const otpRecord = await OtpModel.findOne({
      email: email.toLowerCase(),
      type: "email-verify",
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return sendErrorResponse(
        res,
        STATUS.UNPROCESSABLE_ENTITY,
        "Please verify your email with OTP before registering."
      );
    }

    // Consume the OTP so it cannot be reused
    await OtpModel.deleteOne({ _id: otpRecord._id });

    // Password hashing & timestamps are handled by pre-save hooks in RoleModel
    const newUser = new roleModel({
      name,
      email,
      mobileNumber,
      companyName,
      password,
      isAgency: isAgency || false,
      role: isAgency ? "Organizer" : "User",
    });

    await newUser.save();

    return sendCreateSuccessResponse(
      res,
      STATUS.CREATED,
      RESPONSE_MESSAGES.REGISTRATION_SUCCESS(name),
      { userID: newUser._id }
    );
  } catch (error) {
    console.error("Error Registering user:", error.message);
    return sendErrorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.REGISTRATION_FAILED
    );
  }
};

// ─── Get Current User Profile ─────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await roleModel.findById(req.user._id).select("-password");

    if (!user) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("User"));
    }

    const userData = {
      ID: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      mobileNumber: user.mobileNumber,
      isAgency: user.isAgency,
      status: user.status,
      authProvider: user.authProvider,
      createdDate: user.createdDate,
    };

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.FETCH_SUCCESS("User"),
      userData,
      "user"
    );
  } catch (error) {
    console.error("Get Me Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.FETCH_FAILED);
  }
};

// ─── Get All Users (Admin) ────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (role && role !== "All") {
      query.role = role;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await roleModel
      .find(query)
      .select("-password")
      .sort({ createdDate: -1 });

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.FETCH_SUCCESS("Users"),
      users,
      "users"
    );
  } catch (error) {
    console.error("Get All Users Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.FETCH_FAILED);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    // Invalidate all existing tokens for this user by bumping the version
    const cookieToken = req.cookies?.token;
    if (cookieToken) {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.decode(cookieToken);
      if (decoded?._id) {
        await roleModel.findByIdAndUpdate(decoded._id, { $inc: { tokenVersion: 1 } });
      }
    }
  } catch {
    // Best-effort invalidation — still clear the cookie
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(STATUS.OK).json({ success: true, message: "Logged out successfully." });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Email is required.");
  }

  try {
    const user = await roleModel.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return sendSuccessResponse(res, STATUS.OK, RESPONSE_MESSAGES.REST_PASSWORD_SUCCESS, null, "data");
    }

    if (user.authProvider === "google") {
      return sendErrorResponse(
        res,
        STATUS.BAD_REQUEST,
        "This account uses Google Sign-In. Please log in with Google."
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.WEB_URL}/reset-password/${rawToken}`;
    await dispatchEmail("password-reset-link", { email: user.email, name: user.name, url: resetUrl });

    return sendSuccessResponse(res, STATUS.OK, RESPONSE_MESSAGES.REST_PASSWORD_SUCCESS, null, "data");
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.REST_PASSWORD_FAILED);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Token and new password are required.");
  }

  if (password.length < 8) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Password must be at least 8 characters.");
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await roleModel.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return sendErrorResponse(res, STATUS.BAD_REQUEST, ERROR_MESSAGES.PASSWORD_EXPIRED);
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.tokenVersion += 1; // invalidate all existing sessions
    await user.save();

    await dispatchEmail("password-reset-confirm", { email: user.email, name: user.name });

    return sendSuccessResponse(res, STATUS.OK, RESPONSE_MESSAGES.RESET_PASSWORD_SUCCESS, null, "data");
  } catch (error) {
    console.error("Reset Password Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.RESET_PASSWORD_FAILED);
  }
};

// ─── Reset Password via OTP ───────────────────────────────────────────────────
exports.resetPasswordOtp = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Email and new password are required.");
  }

  if (newPassword.length < 8) {
    return sendErrorResponse(res, STATUS.UNPROCESSABLE_ENTITY, "Password must be at least 8 characters.");
  }

  try {
    const otpRecord = await OtpModel.findOne({
      email: email.toLowerCase(),
      type: "password-reset",
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return sendErrorResponse(
        res,
        STATUS.BAD_REQUEST,
        "OTP verification required. Please verify your OTP first."
      );
    }

    const user = await roleModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("User"));
    }

    user.password = newPassword;
    user.tokenVersion += 1; // invalidate existing sessions
    await user.save();

    // Consume the OTP
    await OtpModel.deleteOne({ _id: otpRecord._id });

    await dispatchEmail("password-reset-confirm", { email: user.email, name: user.name });

    return sendSuccessResponse(res, STATUS.OK, "Password reset successfully.", null, "data");
  } catch (error) {
    console.error("Reset Password OTP Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to reset password. Please try again.");
  }
};

// ─── Update User Status (Admin) ───────────────────────────────────────────────
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["Active", "Suspended"].includes(status)) {
    return sendErrorResponse(
      res,
      STATUS.UNPROCESSABLE_ENTITY,
      "Invalid status. Must be 'Active' or 'Suspended'."
    );
  }

  try {
    const user = await roleModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return sendErrorResponse(res, STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND("User"));
    }

    return sendSuccessResponse(
      res,
      STATUS.OK,
      RESPONSE_MESSAGES.STATUS_UPDATED_SUCCESS("User"),
      user,
      "user"
    );
  } catch (error) {
    console.error("Update User Status Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.STATUS_UPDATE_FAILED);
  }
};
