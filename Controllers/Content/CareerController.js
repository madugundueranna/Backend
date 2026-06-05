const Career = require("../../Models/Content/CareerModel");
const { sendSuccessResponse, sendErrorResponse } = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

exports.getCareers = async (req, res) => {
  try {
    const careers = await Career.find({ isActive: true }).sort({ createdAt: -1 });
    return sendSuccessResponse(res, STATUS.OK, "Careers fetched.", careers, "careers");
  } catch (error) {
    console.error("Get Careers Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch careers.");
  }
};
