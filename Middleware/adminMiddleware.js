const { sendErrorResponse } = require("../Common/Responses");
const STATUS = require("../Common/StatusCodes");

module.exports = (req, res, next) => {
  if (req.user?.role !== "Admin")
    return sendErrorResponse(res, STATUS.FORBIDDEN, "Admin access required.");
  next();
};
