const jwt = require("jsonwebtoken");
const roleModel = require("../Models/Authentication/RoleModel");
const { sendErrorResponse } = require("../Common/Responses");
const STATUS = require("../Common/StatusCodes");

module.exports = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token)
    return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Authentication required.");

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await roleModel.findById(decoded._id).select("-password");

    if (!user)
      return sendErrorResponse(res, STATUS.UNAUTHORIZED, "User not found.");

    if (user.tokenVersion !== decoded.tokenVersion)
      return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Session expired. Please log in again.");

    if (user.status === "Suspended")
      return sendErrorResponse(res, STATUS.FORBIDDEN, "Account suspended.");

    req.user = user;
    next();
  } catch {
    return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Invalid or expired token.");
  }
};
