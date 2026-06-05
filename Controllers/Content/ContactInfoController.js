const ContactInfo = require("../../Models/Content/ContactInfoModel");
const { sendSuccessResponse, sendErrorResponse } = require("../../Common/Responses");
const STATUS = require("../../Common/StatusCodes");

exports.getContactInfo = async (req, res) => {
  try {
    const info = await ContactInfo.findOne();
    return sendSuccessResponse(res, STATUS.OK, "Contact info fetched.", info || {}, "contactInfo");
  } catch (error) {
    console.error("Get Contact Info Error:", error);
    return sendErrorResponse(res, STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch contact info.");
  }
};
