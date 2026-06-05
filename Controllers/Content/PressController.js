const Press = require("../../Models/Content/PressModel");
const { sendSuccessResponse, sendErrorResponse } = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

exports.getPress = async (req, res) => {
  try {
    const items = await Press.find().sort({ createdAt: -1 });
    return sendSuccessResponse(res, STATUS.OK, "Press items fetched.", items, "press");
  } catch (error) {
    console.error("Get Press Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch press items.");
  }
};
