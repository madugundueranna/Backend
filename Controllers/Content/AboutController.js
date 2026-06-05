const About = require("../../Models/Content/AboutModel");
const { sendSuccessResponse, sendErrorResponse } = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne();
    return sendSuccessResponse(res, STATUS.OK, "About content fetched.", about || {}, "about");
  } catch (error) {
    console.error("Get About Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch about content.");
  }
};
