const jwt = require("jsonwebtoken");
const roleModel = require("../../Models/Authentication/RoleModel");
const { sendErrorResponse } = require("../Responses");
const STATUS = require("../StatusCodes");

// ─── Authenticate: Verify JWT Token ──────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return sendErrorResponse(
        res,
        STATUS.UNAUTHORIZED,
        "Access denied. No token provided."
      );
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch full user to confirm they exist and are active
    const user = await roleModel.findById(decoded._id);

    if (!user) {
      return sendErrorResponse(
        res,
        STATUS.UNAUTHORIZED,
        "User not found. Token is invalid."
      );
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Session has been invalidated. Please login again.");
    }

    if (user.status === "Suspended") {
      return sendErrorResponse(
        res,
        STATUS.FORBIDDEN,
        "Your account has been suspended. Please contact support."
      );
    }

    req.user = { _id: user._id, role: user.role, name: user.name, email: user.email };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Token has expired. Please login again.");
    }
    if (error.name === "JsonWebTokenError") {
      return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Invalid token.");
    }
    console.error("Auth Middleware Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Authentication failed.");
  }
};

// ─── Authorize: Role-Based Access Control ────────────────────────────────────
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Not authenticated.");
    }

    if (!roles.includes(req.user.role)) {
      return sendErrorResponse(
        res,
        STATUS.FORBIDDEN,
        "You don't have permission to perform this action."
      );
    }

    next();
  };
};

module.exports = { authenticate, authorizeRole };
